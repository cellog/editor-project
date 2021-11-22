// @refresh reset // Fixes hot refresh errors in development https://github.com/ianstormtaylor/slate/issues/3477

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createEditor, Descendant, BaseEditor } from 'slate'
import { withHistory, HistoryEditor } from 'slate-history'
import {
  withYjs,
  SyncElement,
  toSharedType,
  withCursor,
  useCursors,
  YjsEditor,
  CursorEditor,
} from 'slate-yjs'
import * as Y from 'yjs'
import { Editable, withReact, Slate, ReactEditor } from 'slate-react'
import { WebsocketProvider } from 'y-websocket'
import randomColor from 'randomcolor'

import { handleHotkeys } from './helpers'
import { EditorToolbar } from './EditorToolbar'
import { CustomElement } from './CustomElement'
import { CustomLeaf, CustomText } from './CustomLeaf'
import { withHtml } from './helpers/withHtml'
import Button from '@mui/material/Button'
// import { Debug } from './elements/Debug'
// import { YContextProvider } from './elements'

// Slate suggests overwriting the module to include the ReactEditor, Custom Elements & Text
// https://docs.slatejs.org/concepts/12-typescript
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor
    Element: CustomElement
    Text: CustomText
  }
}

interface EditorProps {
  initialValue?: Descendant[]
  placeholder?: string
  noteId: string
  name: string
}

export const _Editor = ({
  // initialValue = [
  //   { type: 'paragraph', children: [{ text: 'Begin editing!' }] },
  // ],
  placeholder,
  noteId: id,
  name,
}: EditorProps): React.ReactElement => {
  const renderElement = useCallback((props) => <CustomElement {...props} />, [])
  const renderLeaf = useCallback((props) => <CustomLeaf {...props} />, [])
  const [value, setValue] = useState<Descendant[]>([])
  const [isOnline, setOnlineState] = useState<boolean>(false)

  const color = useMemo(
    () =>
      randomColor({
        luminosity: 'dark',
        format: 'rgba',
        alpha: 1,
      }),
    []
  )

  const [sharedType, provider] = useMemo(() => {
    const doc = new Y.Doc()
    const sharedType = doc.getArray<SyncElement>('content')
    const provider = new WebsocketProvider(
      `ws://localhost:3001/api/yjs/${id}`,
      id,
      doc,
      {
        connect: false,
      }
    )

    return [sharedType, provider]
  }, [id])

  const editor: BaseEditor &
    ReactEditor &
    HistoryEditor &
    YjsEditor &
    CursorEditor = useMemo(() => {
    return withCursor(
      withYjs(withReact(withHistory(withHtml(createEditor()))), sharedType),
      provider.awareness
    )

    return editor
  }, [sharedType, provider])

  useEffect(() => {
    provider.on('status', ({ status }: { status: string }) => {
      setOnlineState(status === 'connected')
    })

    provider.awareness.setLocalState({
      alphaColor: color.slice(0, -2) + '0.2)',
      color,
      name,
    })

    // Super hacky way to provide a initial value from the client, if
    // you plan to use y-websocket in prod you probably should provide the
    // initial state from the server.
    provider.on('sync', (isSynced: boolean) => {
      if (isSynced && sharedType.length === 0) {
        toSharedType(sharedType, [
          { type: 'paragraph', children: [{ text: 'Hello world!' }] },
        ])
      }
    })

    provider.connect()

    return () => {
      provider.disconnect()
    }
  }, [provider])

  const { decorate } = useCursors(editor)

  const toggleOnline = () => {
    isOnline ? provider.disconnect() : provider.connect()
  }

  return (
    <Slate editor={editor} value={value} onChange={(value) => setValue(value)}>
      <Button type="button" onClick={toggleOnline}>
        Go {isOnline ? 'offline' : 'online'}
      </Button>
      <EditorToolbar />
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder={placeholder}
        onKeyDown={handleHotkeys(editor)}
        // The dev server injects extra values to the editor and the console complains
        // so we override them here to remove the message
        // autoCapitalize="false"
        // autoCorrect="false"
        // spellCheck="false"
        decorate={decorate}
      />
      {/* <YContextProvider ops={sharedType}>
        <Debug />
      </YContextProvider> */}
    </Slate>
  )
}

export const Editor = (props: EditorProps): React.ReactElement | null => {
  if (typeof window === 'undefined') {
    // don't attempt to render the editor on the server
    return null
  }
  return <_Editor {...props} />
}
