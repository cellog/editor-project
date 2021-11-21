import { Editor, Transforms, Node } from 'slate'
import { deserialize } from './deserialize'
import { wrapTopLevelInlineNodesInParagraphs } from './wrapTopLevelInlineNodesInParagraphs'

export const withHtml = (editor: Editor): Editor => {
  const { insertData } = editor

  editor.insertData = (data: DataTransfer) => {
    const html = data.getData('text/html')

    if (html) {
      const newHTML = html.replace(/>\s+</g, '><')
      const parsed = new DOMParser().parseFromString(newHTML, 'text/html')
      const fragment = wrapTopLevelInlineNodesInParagraphs(
        editor,
        deserialize(parsed.body) as unknown as Node[]
      )
      Transforms.insertFragment(editor, fragment)
    } else {
      insertData(data)
    }
  }

  return editor
}
