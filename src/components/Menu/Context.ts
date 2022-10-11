import React from 'react'

export interface MenuContextType {
    selectedKey: string;
    onSelect: (selectedKey: string, selectedItem?: Record<string, any>) => void
}

export const MenuContext = React.createContext<MenuContextType>(null)