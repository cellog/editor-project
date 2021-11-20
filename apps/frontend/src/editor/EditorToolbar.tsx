import React, { MouseEventHandler } from 'react'
import MUIButton from '@mui/material/Button'
import FormatUnderlinedOutlinedIcon from '@mui/icons-material/FormatUnderlinedOutlined'
import FormatBoldOutlinedIcon from '@mui/icons-material/FormatBoldOutlined'
import FormatItalicOutlinedIcon from '@mui/icons-material/FormatItalicOutlined'
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined'
import FormatQuoteOutlinedIcon from '@mui/icons-material/FormatQuoteOutlined'
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined'
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined'

import { useSlate } from 'slate-react'

import { toggleBlock, toggleMark, isBlockActive, isMarkActive } from './helpers'
import { CustomElementType } from './CustomElement'
import { CustomText } from './CustomLeaf'

const icons = {
  bold: <FormatBoldOutlinedIcon />,
  italic: <FormatItalicOutlinedIcon />,
  underlined: <FormatUnderlinedOutlinedIcon />,
  code: <CodeOutlinedIcon />,
  h1: 'h1',
  h2: 'h2',
  quote: <FormatQuoteOutlinedIcon />,
  list_numbered: <FormatListNumberedOutlinedIcon />,
  list_bulleted: <FormatListBulletedOutlinedIcon />,
}

interface ButtonProps {
  active: boolean
  onMouseDown: MouseEventHandler<HTMLButtonElement>
  icon?: keyof typeof icons
}

const Button: React.FC<ButtonProps> = ({
  active,
  children,
  onMouseDown,
  icon,
}) => {
  if (icon) {
    return (
      <MUIButton
        onMouseDown={onMouseDown}
        variant={active ? 'contained' : 'outlined'}
      >
        {icons[icon]}
      </MUIButton>
    )
  }
  return (
    <MUIButton
      onMouseDown={onMouseDown}
      variant={active ? 'contained' : 'outlined'}
      startIcon={icon}
    >
      {children}
    </MUIButton>
  )
}

interface BlockButtonProps {
  format: CustomElementType
  icon: keyof typeof icons
}

const BlockButton: React.FC<BlockButtonProps> = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
      icon={icon}
    />
  )
}

interface MarkButtonProps {
  format: keyof CustomText
  icon: keyof typeof icons
}

const MarkButton: React.FC<MarkButtonProps> = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
      icon={icon}
    />
  )
}

export const EditorToolbar: React.FC = () => {
  return (
    <div>
      <MarkButton format="bold" icon="bold" />
      <MarkButton format="italic" icon="italic" />
      <MarkButton format="underline" icon="underlined" />
      <MarkButton format="code" icon="code" />
      <BlockButton format="heading-one" icon="h1" />
      <BlockButton format="heading-two" icon="h2" />
      <BlockButton format="block-quote" icon="quote" />
      <BlockButton format="numbered-list" icon="list_numbered" />
      <BlockButton format="bulleted-list" icon="list_bulleted" />
    </div>
  )
}
