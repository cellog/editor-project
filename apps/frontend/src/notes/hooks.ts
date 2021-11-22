/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { NotesResponse, NoteResponse } from '../../../backend/routes/notes'
import useWebSocket, { ReadyState } from 'react-use-websocket'

// If you want to use GraphQL API or libs like Axios, you can create your own fetcher function.
// Check here for more examples: https://swr.vercel.app/docs/data-fetching
const fetcher = async (input: RequestInfo, init: RequestInit) => {
  const res = await fetch(input, init)
  return res.json()
}

export const useNotesList = () => {
  const { data, error } = useSWR<NotesResponse>(
    'http://localhost:3001/api/notes',
    fetcher
  )

  return {
    notesList: data?.notes,
    isLoading: !error && !data,
    isError: error,
  }
}

export const useNote = (id: string) => {
  const { data, error } = useSWR<NoteResponse>(
    `http://localhost:3001/api/notes/note/${id}`,
    fetcher
  )

  return {
    note: data,
    isLoading: !error && !data,
    isError: error,
  }
}
