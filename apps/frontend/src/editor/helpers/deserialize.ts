import { jsx } from 'slate-hyperscript'
import { CustomElementType } from '../CustomElement'
import { CustomText } from '../CustomLeaf'
import { Node } from 'slate'

const ELEMENT_TAGS: {
  [tagName: string]: (el: HTMLElement | ChildNode) => {
    type: CustomElementType
  }
} = {
  // A: (el: HTMLElement) => ({ type: 'link', url: el.getAttribute('href') }),
  BLOCKQUOTE: () => ({ type: 'block-quote' }),
  H1: () => ({ type: 'heading-one' }),
  H2: () => ({ type: 'heading-two' }),
  LI: () => ({ type: 'list-item' }),
  OL: () => ({ type: 'numbered-list' }),
  P: () => ({ type: 'paragraph' }),
  UL: () => ({ type: 'bulleted-list' }),
}

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS: {
  [tagName: string]: (el: HTMLElement | ChildNode) => Omit<CustomText, 'text'>
} = {
  CODE: () => ({ code: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
}

export function deserialize(
  el: HTMLElement | ChildNode
): (Node | null | string)[] | null | string {
  if (el.nodeType === 3) {
    return el.textContent || ''
  } else if (el.nodeType !== 1) {
    return null
  } else if (el.nodeName === 'BR') {
    return [jsx('element', { type: 'paragraph' }, [jsx('text')])]
  }
  return deserializeElement(el)
}

function deserializeElement(
  el: HTMLElement | ChildNode
): (Node | null | string)[] {
  const { nodeName } = el
  let parent: HTMLElement | ChildNode = el

  if (
    nodeName === 'PRE' &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === 'CODE'
  ) {
    parent = el.childNodes[0]
  }
  let children = Array.from(parent.childNodes).map(deserialize).flat()

  if (children.length === 0) {
    children = [jsx('text')]
  }

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children)
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el)
    return [jsx('element', attrs, children)]
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el)
    return children.map((child) => jsx('text', attrs, child))
  }

  return children
}
