import React, { useContext } from 'react'
import { Editor, Element as SlateElement, Node } from 'slate'
import { useSlate } from 'slate-react'

import { YContext } from './YContext'

export const Debug = (): React.ReactElement => {
  const editor = useSlate()
  const ops = useContext(YContext)
  const parentListItem = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      n.type === 'list-item',
  })
  const [node] = [...parentListItem]
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <b>Editor source (debug)</b>
      <textarea
        readOnly
        style={{ height: 400 }}
        value={JSON.stringify(editor.children, null, 2)}
      />
      <div>current selection: {JSON.stringify(editor.selection)}</div>
      <div>
        listitem ancestor: {node ? JSON.stringify(node, null, 2) : 'none'}
      </div>
      <div>
        parent of list-item:{' '}
        {node ? JSON.stringify(Node.parent(editor, node[1]), null, 2) : 'n/a'}
      </div>
      <div>
        op history:{' '}
        <ul>
          {ops.map((op, index) => (
            <li key={index}>{JSON.stringify(op)}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
