import { deserialize } from './deserialize'
import { Node } from 'slate'
import { jsx } from 'slate-hyperscript'
import { CustomElementType } from '../CustomElement'

const text = (text: string) => jsx('text', undefined, [text])
const element = (type: CustomElementType, children: any[]) =>
  jsx('element', { type }, children)

describe('deserialize', () => {
  const fixtures: [
    description: string,
    html: string,
    expectedResult: (Node | string | null)[] | string | null
  ][] = [
    ['empty text', '', [{ text: '' }]],
    ['just text', 'hi', [{ text: 'hi' }]],
    [
      '<br />',
      '<br />',
      [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
    ],
    ['a comment and ignore it', 'h<!-- hi -->', [{ text: 'h' }]],
    [
      'complex html, removing unnecessary non-semantic whitespace',
      `
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
        </ol>`,
      [
        element('heading-one', [text('H1')]),
        element('heading-two', [text('H2')]),
        text(`
      unwrapped text
      `),
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
      ],
    ],
  ]
  it.each(fixtures)('should parse %s', (_, html, expectedResult) => {
    const newHTML = html.replace(/>\s+</g, '><')
    const { body: parsed } = new DOMParser().parseFromString(
      newHTML,
      'text/html'
    )
    expect(deserialize(parsed)).toEqual(expectedResult)
  })
})
