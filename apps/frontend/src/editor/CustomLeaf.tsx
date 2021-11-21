import React from 'react'
import { BaseText } from 'slate'
import { RenderLeafProps } from 'slate-react'

import { Link } from './elements'

export interface CustomText extends BaseText {
  bold?: boolean
  code?: boolean
  italic?: boolean
  underline?: boolean
  href?: string
}

export const CustomLeaf: React.FC<RenderLeafProps> = ({
  attributes,
  children,
  leaf,
}) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  if (leaf.href) {
    children = <Link href={leaf.href}>{children}</Link>
  }

  return <span {...attributes}>{children}</span>
}
