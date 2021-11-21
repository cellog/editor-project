import { withHtml } from './withHtml'
import { createEditor } from 'slate'
import { jsx } from 'slate-hyperscript'
import { CustomElementType } from '../CustomElement'

const text = (text: string) => jsx('text', undefined, [text])
const element = (type: CustomElementType, children: any[]) =>
  jsx('element', { type }, children)

describe('withHtml', () => {
  it('should correctly deserialize html', () => {
    const input = `
      <h1>H1</h1>
      <h2>H2</h2>
      unwrapped text
      <p>hi
       </p>
        <blockquote>hi</blockquote>
        <ol>
          <li>this</li>
          <li>
            <ul>
              <li>nested</li>
              <li>list</li>
            </ul>
          </li>
        </ol>`
    const output = [
      element('heading-one', [text('H1')]),
      element('heading-two', [text('H2')]),
      element('paragraph', [
        text(`
      unwrapped text
      `),
      ]),
      element('paragraph', [
        text(`hi
       `),
      ]),
      element('block-quote', [text('hi')]),
      element('numbered-list', [
        element('list-item', [text('this')]),
        element('list-item', [
          element('bulleted-list', [
            element('list-item', [text('nested')]),
            element('list-item', [text('list')]),
          ]),
        ]),
      ]),
    ]

    class MockDataTransfer {
      public data = ''

      setData(_type: string, input: string) {
        this.data = input
      }

      getData(_type: string) {
        return this.data
      }
    }
    const transfer = new MockDataTransfer() as unknown as DataTransfer
    transfer.setData('text/html', input)

    const editor = withHtml(createEditor())
    editor.insertNode(element('paragraph', [text('')]))

    editor.insertData(transfer)

    expect(editor.children).toEqual(output)
  })
})
