import encoding from 'lib0/dist/encoding.cjs'
import decoding from 'lib0/dist/decoding.cjs'
import syncProtocol from 'y-protocols/dist/sync.cjs'
import awarenessProtocol from 'y-protocols/dist/awareness.cjs'
import { WebSocket } from 'ws'
import { send } from './send'

export const messageSync = 0
export const messageAwareness = 1

/**
 * @param {any} conn
 * @param {WSSharedDoc} doc
 * @param {Uint8Array} message
 */
export const messageListener = (
  conn: WebSocket,
  doc: any,
  message: Uint8Array
): void => {
  try {
    const encoder = encoding.createEncoder()
    const decoder = decoding.createDecoder(message)
    const messageType = decoding.readVarUint(decoder)
    switch (messageType) {
      case messageSync:
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.readSyncMessage(decoder, encoder, doc, null)
        if (encoding.length(encoder) > 1) {
          send(doc, conn, encoding.toUint8Array(encoder))
        }
        break
      case messageAwareness: {
        awarenessProtocol.applyAwarenessUpdate(
          doc.awareness,
          decoding.readVarUint8Array(decoder),
          conn
        )
        break
      }
    }
  } catch (err) {
    console.error(err)
    doc.emit('error', [err])
  }
}
