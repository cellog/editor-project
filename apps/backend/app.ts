import express from 'express'
import cors from 'cors'
import expressWs from 'express-ws'
import winston from 'winston'
import expressWinston from 'express-winston'

import apiRoutes from './routes'

const app = express()
const PORT = 3001

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
    colorize: true,
  })
)

expressWs(app)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

app.use('/api', apiRoutes)

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`)
})
