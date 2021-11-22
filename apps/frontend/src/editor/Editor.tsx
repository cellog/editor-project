// @refresh reset // Fixes hot refresh errors in development https://github.com/ianstormtaylor/slate/issues/3477

import React, { useCallback, useMemo, useState } from 'react'
import { createEditor, Descendant, BaseEditor } from 'slate'
import { withHistory, HistoryEditor } from 'slate-history'
import { withYjs, SyncElement, toSharedType } from 'slate-yjs'
import * as Y from 'yjs'
import { Editable, withReact, Slate, ReactEditor } from 'slate-react'

import { handleHotkeys } from './helpers'
import { EditorToolbar } from './EditorToolbar'
import { CustomElement } from './CustomElement'
import { CustomLeaf, CustomText } from './CustomLeaf'
// import { Debug } from './elements/Debug'
import { withHtml } from './helpers/withHtml'
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
}

export const Editor: React.FC<EditorProps> = ({
  initialValue = [],
  placeholder,
}) => {
  const [value, setValue] = useState<Descendant[]>(initialValue)
  const renderElement = useCallback((props) => <CustomElement {...props} />, [])
  const renderLeaf = useCallback((props) => <CustomLeaf {...props} />, [])
  const [sharedType, doc] = useMemo(() => {
    const doc = new Y.Doc()
    const sharedType = doc.getArray<SyncElement>('content')
    // const provider = new WebsocketProvider(WEBSOCKET_ENDPOINT, slug, doc, {
    //   connect: false,
    // });

    return [sharedType, doc]
  }, [])
  // note: withHtml must be AFTER withReact for copy/paste of html to preserve formatting, not sure why
  const editor = useMemo(() => {
    if (sharedType.length === 0) {
      // ensure the initial value is populated
      toSharedType(sharedType, value)
    }
    return withYjs(withReact(withHistory(withHtml(createEditor()))), sharedType)
  }, [sharedType])
  console.log(doc)

  return (
    <Slate editor={editor} value={value} onChange={(value) => setValue(value)}>
      <EditorToolbar />
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder={placeholder}
        onKeyDown={handleHotkeys(editor)}
        // The dev server injects extra values to the editr and the console complains
        // so we override them here to remove the message
        autoCapitalize="false"
        autoCorrect="false"
        spellCheck="false"
      />
      {/* <YContextProvider ops={sharedType}>
        <Debug />
      </YContextProvider> */}
    </Slate>
  )
}
