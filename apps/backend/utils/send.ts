import { closeConn } from './closeConn'
import { WebSocket } from 'ws'

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1
const wsReadyStateClosing = 2 // eslint-disable-line
const wsReadyStateClosed = 3 // eslint-disable-line

/**
 * @param {WSSharedDoc} doc
 * @param {any} conn
 * @param {Uint8Array} m
 */
export const send = (doc: any, conn: WebSocket, m: any): void => {
  if (
    conn.readyState !== wsReadyStateConnecting &&
    conn.readyState !== wsReadyStateOpen
  ) {
    closeConn(doc, conn)
  }
  try {
    conn.send(m, (err) => {
      err != null && closeConn(doc, conn)
    })
  } catch (e) {
    closeConn(doc, conn)
  }
}
