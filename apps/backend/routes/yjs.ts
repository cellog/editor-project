import express from 'express'
import { WebsocketRequestHandler } from 'express-ws'
import encoding from 'lib0/dist/encoding.cjs'
import syncProtocol from 'y-protocols/dist/sync.cjs'
import awarenessProtocol from 'y-protocols/dist/awareness.cjs'

import { getYDoc } from 'y-websocket/bin/utils'
import { closeConn } from '../utils/closeConn'

import {
  messageAwareness,
  messageListener,
  messageSync,
} from '../utils/messageListener'
import { send } from '../utils/send'

// Patch `express.Router` to support `.ws()` without needing to pass around a `ws`-ified app.
// https://github.com/HenningM/express-ws/issues/86
// eslint-disable-next-line @typescript-eslint/no-var-requires
const patch = require('express-ws/lib/add-ws-method')
patch.default(express.Router)

const router = express.Router()

const garbageCollect = true

const pingTimeout = 3000

const noteHandler: WebsocketRequestHandler = (ws, req) => {
  // setupWSConnection(ws, req, { docName: req.params.id })
  ws.binaryType = 'arraybuffer'
  const doc = getYDoc(req.params.id, garbageCollect)
  doc.conns.set(ws, new Set())
  ws.on('message', (message: ArrayBuffer) => {
    messageListener(ws, doc, new Uint8Array(message))
  })

  // Check if connection is still alive
  let pongReceived = true
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      if (doc.conns.has(ws)) {
        closeConn(doc, ws)
      }
      clearInterval(pingInterval)
    } else if (doc.conns.has(ws)) {
      pongReceived = false
      try {
        ws.ping()
      } catch (e) {
        closeConn(doc, ws)
        clearInterval(pingInterval)
      }
    }
  }, pingTimeout)
  ws.on('close', () => {
    closeConn(doc, ws)
  })
  // put the following in a variables in a block so the interval handlers don't keep in in
  // scope
  {
    // send sync step 1
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageSync)
    syncProtocol.writeSyncStep1(encoder, doc)
    send(doc, ws, encoding.toUint8Array(encoder))
    const awarenessStates = doc.awareness.getStates()
    if (awarenessStates.size > 0) {
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(
          doc.awareness,
          Array.from(awarenessStates.keys())
        )
      )
      send(doc, ws, encoding.toUint8Array(encoder))
    }
  }
}

router.ws('/:id', noteHandler)

export default router
