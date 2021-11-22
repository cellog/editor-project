import express, { RequestHandler, Response } from 'express'
// import { WebsocketRequestHandler } from 'express-ws'
// import { Descendant } from 'slate'

import { NOTE_1, NOTE_2 } from '../fixtures/notes'

// Patch `express.Router` to support `.ws()` without needing to pass around a `ws`-ified app.
// https://github.com/HenningM/express-ws/issues/86
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const patch = require('express-ws/lib/add-ws-method')
// patch.default(express.Router)

const router = express.Router()

export interface NotesResponse {
  notes: Array<{
    id: string
    title: string
  }>
}

export interface NoteResponse {
  id: string
  title: string
}

const notesHandler: RequestHandler = (_req, res: Response<NotesResponse>) => {
  res.json({
    notes: [
      {
        id: NOTE_1.id,
        title: NOTE_1.title,
      },
      {
        id: NOTE_2.id,
        title: NOTE_2.title,
      },
    ],
  })
}

const noteHandler: RequestHandler = (req, res: Response<NoteResponse>) => {
  const note = req.params.id === NOTE_1.id ? NOTE_1 : NOTE_2
  res.json({
    id: note.id,
    title: note.title,
  })
}

router.get('/', notesHandler)
router.get('/note/:id', noteHandler)

export default router
