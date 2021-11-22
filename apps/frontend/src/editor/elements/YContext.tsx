import React, { createContext } from 'react'
import { SyncElement } from 'slate-yjs'
import * as Y from 'yjs'
import { YContextProps } from './types'

export const YContext = createContext<Y.Array<SyncElement>>(new Y.Array())

export const YContextProvider = ({
  children,
  ops,
}: YContextProps): React.ReactElement => {
  return <YContext.Provider value={ops}>{children}</YContext.Provider>
}
