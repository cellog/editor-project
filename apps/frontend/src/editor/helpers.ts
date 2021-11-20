import { Editor, Transforms, Element as SlateElement, Node, Path } from 'slate'
import isHotkey from 'is-hotkey'
import { KeyboardEvent } from 'react'
import { CustomElementType } from './CustomElement'
import { CustomText } from './CustomLeaf'

const LIST_TYPES = ['numbered-list', 'bulleted-list']

export const toggleBlock = (
  editor: Editor,
  format: CustomElementType
): void => {
  const isActive = isBlockActive(editor, format)
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      LIST_TYPES.includes(
        !Editor.isEditor(n) && SlateElement.isElement(n) && (n.type as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      ),
    split: true,
  })
  const newProperties: Partial<SlateElement> = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  }
  Transforms.setNodes(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const matchElement = (type: CustomElementType) => (n: Node) =>
  !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === type
const matchListItem = matchElement('list-item')
const matchList = (n: Node) =>
  !Editor.isEditor(n) &&
  SlateElement.isElement(n) &&
  (n.type === 'bulleted-list' || n.type === 'numbered-list')

export const nestBlock = (editor: Editor, direction: 1 | -1 = 1): void => {
  // retrieve the closest list-item
  const parentListItem = Editor.nodes(editor, {
    match: matchListItem,
  })
  const [node] = [...parentListItem]
  if (!node) {
    return toggleBlock(editor, 'bulleted-list')
  }

  const parentList = Node.parent(editor, node[1])
  if (!SlateElement.isElement(parentList)) {
    return toggleBlock(editor, 'bulleted-list')
  }
  const innerList = {
    type: parentList.type,
    children: [],
  }

  if (direction === -1) {
    const parentListPath = Path.parent(node[1])
    // first, verify whether this is a top-level list or not
    const parentList = Editor.nodes(editor, {
      at: [],
      match: (n, path) => {
        if (
          Editor.isEditor(n) ||
          !SlateElement.isElement(n) ||
          path.length > 1 ||
          path.length >= parentListPath.length ||
          (n.type !== 'bulleted-list' && n.type !== 'numbered-list')
        ) {
          return false
        }
        console.log(n, path)
        return true
      },
    })
    const [testNode] = [...parentList]
    if (testNode) {
      Transforms.unwrapNodes(editor, {
        at: Path.parent(node[1]),
      })
    } else {
      Transforms.setNodes(
        editor,
        {
          lifted: true,
        },
        {
          at: node[1],
        }
      )
      Transforms.liftNodes(editor, {
        at: node[1],
      })
      Transforms.setNodes(
        editor,
        {
          type: 'paragraph',
        },
        {
          match: (n) =>
            !Editor.isEditor(n) && SlateElement.isElement(n) && !!n.lifted,
        }
      )
      Transforms.unsetNodes(editor, 'lifted', {
        match: (n) =>
          !Editor.isEditor(n) && SlateElement.isElement(n) && !!n.lifted,
      })
    }
  } else {
    Transforms.wrapNodes(editor, innerList, {
      at: node[1],
    })
  }
}

export const toggleMark = (editor: Editor, format: keyof CustomText): void => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

export const isBlockActive = (
  editor: Editor,
  format: CustomElementType
): boolean => {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  })

  return !!match
}

export const isMarkActive = (
  editor: Editor,
  format: keyof CustomText
): boolean => {
  const marks = Editor.marks(editor)
  return marks ? format in marks === true : false
}

const HOTKEYS: Record<string, keyof CustomText> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}

export const handleHotkeys =
  (editor: Editor) =>
  (event: KeyboardEvent<HTMLDivElement>): void => {
    for (const hotkey in HOTKEYS) {
      if (isHotkey(hotkey, event)) {
        event.preventDefault()
        const mark = HOTKEYS[hotkey]
        toggleMark(editor, mark)
      }
    }
    if (isHotkey('tab', event)) {
      event.preventDefault()
      nestBlock(editor)
    } else if (isHotkey('shift+tab', event)) {
      event.preventDefault()
      nestBlock(editor, -1)
    }
  }
