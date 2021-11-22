import React from 'react'
import { Editor } from '../editor'
import { ReadyState } from 'react-use-websocket'

import { Paper, TextField, Badge, BadgeTypeMap } from '@mui/material'
import { useNote } from './hooks'

interface SingleNoteProps {
  id: string
}

const Home: React.FC<SingleNoteProps> = ({ id }) => {
  const readyState = ReadyState.OPEN
  const { note } = useNote(id)

  const connectionStatusColor = {
    [ReadyState.CONNECTING]: 'info',
    [ReadyState.OPEN]: 'success',
    [ReadyState.CLOSING]: 'warning',
    [ReadyState.CLOSED]: 'error',
    [ReadyState.UNINSTANTIATED]: 'error',
  }[readyState] as BadgeTypeMap['props']['color']

  return note ? (
    <>
      <Badge color={connectionStatusColor} variant="dot" sx={{ width: '100%' }}>
        <TextField
          value={note.title}
          variant="standard"
          fullWidth={true}
          inputProps={{ style: { fontSize: 32, color: '#666' } }}
          sx={{ mb: 2 }}
        />
      </Badge>
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Editor noteId={id} name={note.title} />
      </Paper>
    </>
  ) : null
}

export default Home
