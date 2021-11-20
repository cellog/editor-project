import React from 'react'
import { BaseElement } from 'slate'
import { RenderElementProps } from 'slate-react'

export type CustomElementType =
  | 'block-quote'
  | 'bulleted-list'
  | 'heading-one'
  | 'heading-two'
  | 'list-item'
  | 'numbered-list'
  | 'paragraph'

export type NestableType = Extract<
  CustomElementType,
  'bulletedList' | 'numberedList'
>

export interface CustomElement extends BaseElement {
  type: CustomElementType
  lifted?: true
}

export const CustomElement: React.FC<RenderElementProps> = ({
  attributes,
  children,
  element,
}) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>
    default:
      return <p {...attributes}>{children}</p>
  }
}
