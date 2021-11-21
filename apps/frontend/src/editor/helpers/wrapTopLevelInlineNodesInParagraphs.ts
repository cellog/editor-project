import { jsx } from 'slate-hyperscript'
import { Editor, Node, Text } from 'slate'

interface NodeResult {
  nodes: Node[]
  inlineNodes: Node[]
}

export const wrapTopLevelInlineNodesInParagraphs = (
  editor: Editor,
  fragment: Node[]
): Node[] => {
  const wrappedNodes = fragment.reduce(
    (result: NodeResult, nextNode): NodeResult => {
      const { nodes, inlineNodes } = result
      if (Text.isText(nextNode) || Editor.isInline(editor, nextNode)) {
        inlineNodes.push(nextNode)
        return { nodes, inlineNodes }
      } else if (inlineNodes.length > 0) {
        nodes.push(jsx('element', { type: 'paragraph' }, inlineNodes))
        nodes.push(nextNode)
        return { nodes, inlineNodes: [] }
      } else {
        nodes.push(nextNode)
        return { nodes, inlineNodes }
      }
    },
    { nodes: [], inlineNodes: [] }
  )
  if (wrappedNodes.inlineNodes.length) {
    wrappedNodes.nodes.push(
      jsx('element', { type: 'paragraph' }, wrappedNodes.inlineNodes)
    )
  }
  return wrappedNodes.nodes
}
