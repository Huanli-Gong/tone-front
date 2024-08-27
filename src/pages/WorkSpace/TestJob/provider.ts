import React from 'react';

export const TestJobProvider = React.createContext<any>({});

export const useTestJobContext = () => React.useContext(TestJobProvider);
