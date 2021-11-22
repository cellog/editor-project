import express from 'express'
import notesRouter from './notes'
import yjsRouter from './yjs'

const router = express.Router()

router.use('/notes', notesRouter)
router.use('/yjs', yjsRouter)

export default router
