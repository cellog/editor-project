import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Transforms } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'
import Tooltip from '@mui/material/Tooltip'
import Popper from '@mui/material/Popper'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import Typography from '@mui/material/Typography'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'
import isHotkey from 'is-hotkey'

import { LinkProps } from './types'

export function Link({ href, children }: LinkProps): React.ReactElement {
  const editor = useSlate()
  const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null)
  const [newHref, setNewHref] = useState(href)
  const aRef = useRef<HTMLAnchorElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const onClick = useCallback(() => {
    setAnchorEl(anchorEl ? null : aRef.current)
  }, [anchorEl])
  const resetAndClose = useCallback(() => {
    setNewHref(href)
    setAnchorEl(null)
  }, [href])
  const saveHrefChanges = useCallback(() => {
    if (!anchorEl) {
      return
    }
    const linkNode = ReactEditor.toSlateNode(editor, anchorEl)
    const path = ReactEditor.findPath(editor, linkNode)
    Transforms.setNodes(editor, { href: newHref }, { at: path })
    setAnchorEl(null)
  }, [anchorEl, editor, newHref])
  useEffect(() => {
    const listenForEscape = (e: KeyboardEvent) => {
      if (anchorEl) {
        if (isHotkey('esc', e)) {
          setAnchorEl(null)
        }
      }
    }
    document.addEventListener('keydown', listenForEscape)
    return () => {
      document.removeEventListener('keydown', listenForEscape)
    }
  }, [anchorEl])
  useEffect(() => {
    // trigger the popup immediately on adding a link
    aRef.current?.click()
  }, [])
  const id = anchorEl ? `link-${href}` : undefined
  return (
    <>
      <Tooltip title={href} arrow>
        <a ref={aRef} href={href} onClick={onClick}>
          {children}
        </a>
      </Tooltip>
      <Popper id={id} open={!!anchorEl} anchorEl={anchorEl} placement="auto">
        <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>
          <Card sx={{ maxWidth: 800 }}>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Change href
              </Typography>
              <Typography variant="body1" component="p"></Typography>
              <Input
                sx={{ width: 500 }}
                value={newHref}
                onChange={(e) => setNewHref(e.target.value)}
                placeholder="http://example.com"
              />
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="contained"
                onClick={saveHrefChanges}
              >
                Save
              </Button>
              <Button size="small" variant="outlined" onClick={resetAndClose}>
                Cancel
              </Button>
              <Button
                size="small"
                onClick={() => {
                  linkRef.current?.click()
                }}
                endIcon={<OpenInNewOutlinedIcon fontSize="small" />}
              >
                Follow link
              </Button>
              <a
                ref={linkRef}
                style={{ display: 'none' }}
                href={newHref}
                target="_blank"
                rel="noopener nofollow noreferrer"
              >
                Follow link
              </a>
            </CardActions>
          </Card>
        </Box>
      </Popper>
    </>
  )
}
