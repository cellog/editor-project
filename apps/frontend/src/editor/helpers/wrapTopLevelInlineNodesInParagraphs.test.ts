import { jsx } from 'slate-hyperscript'
import { createEditor, Node } from 'slate'
import { CustomElementType } from '../CustomElement'
import { CustomText } from '../CustomLeaf'
import { wrapTopLevelInlineNodesInParagraphs } from './wrapTopLevelInlineNodesInParagraphs'

const text = (text: string, attributes?: Omit<CustomText, 'text'>) =>
  jsx('text', attributes, [text])
const element = (type: CustomElementType, children: any[]) =>
  jsx('element', { type }, children)

describe('wrapTopLevelInlineNodesInParagraphs', () => {
  it('should wrap only top-level inline nodes into paragraphs', () => {
    const editor = createEditor()
    const startNodes: Node[] = [
      element('paragraph', [text('hi')]),
      text('not wrapped!', { code: true }),
      element('paragraph', [text('hi')]),
    ]
    const endNodes: Node[] = [
      element('paragraph', [text('hi')]),
      element('paragraph', [text('not wrapped!', { code: true })]),
      element('paragraph', [text('hi')]),
    ]

    expect(wrapTopLevelInlineNodesInParagraphs(editor, startNodes)).toEqual(
      endNodes
    )
  })

  it('should wrap consecutive top-level inline nodes into 1 paragraph', () => {
    const editor = createEditor()
    const startNodes: Node[] = [
      element('paragraph', [text('hi')]),
      text('not wrapped!', { code: true }),
      text('not wrapped 2!'),
      element('paragraph', [text('hi')]),
    ]
    const endNodes: Node[] = [
      element('paragraph', [text('hi')]),
      element('paragraph', [
        text('not wrapped!', { code: true }),
        text('not wrapped 2!'),
      ]),
      element('paragraph', [text('hi')]),
    ]

    expect(wrapTopLevelInlineNodesInParagraphs(editor, startNodes)).toEqual(
      endNodes
    )
  })
})
