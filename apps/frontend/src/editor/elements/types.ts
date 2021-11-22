import { SyncElement } from 'slate-yjs'
import { Array } from 'yjs'
export interface LinkProps {
  href: string
  children: React.ReactNode
}

export interface YContextProps {
  children: React.ReactNode
  ops: Array<SyncElement>
}
