import awarenessProtocol from 'y-protocols/dist/awareness.cjs'
import { WebSocket } from 'ws'

/**
 * @param {WSSharedDoc} doc
 * @param {any} conn
 */
export const closeConn = (doc: any, conn: WebSocket): void => {
  if (doc.conns.has(conn)) {
    const controlledIds: Set<number> = doc.conns.get(conn)
    doc.conns.delete(conn)
    awarenessProtocol.removeAwarenessStates(
      doc.awareness,
      Array.from(controlledIds),
      null
    )
    // if (doc.conns.size === 0 && persistence !== null) {
    //   // if persisted, we store state and destroy ydocument
    //   persistence.writeState(doc.name, doc).then(() => {
    //     doc.destroy()
    //   })
    //   docs.delete(doc.name)
    // }
  }
  conn.close()
}
