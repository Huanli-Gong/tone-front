import React from 'react';

export const DrawerProvider = React.createContext<any>(null);

export const useDrawerProvider = () => {
    return React.useContext(DrawerProvider);
};
