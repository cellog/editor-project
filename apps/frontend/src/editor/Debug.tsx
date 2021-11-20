import React from 'react'
import { useSlate } from 'slate-react'
export const Debug = (): React.ReactElement => {
  const editor = useSlate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <b>Editor source (debug)</b>
      <textarea
        style={{ height: 400 }}
        value={JSON.stringify(editor.children, null, 2)}
      />
    </div>
  )
}
