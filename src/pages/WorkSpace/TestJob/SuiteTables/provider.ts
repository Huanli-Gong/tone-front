import React from 'react';

export const SuiteTableProvider = React.createContext<any>({});

export const useSuiteTableContext = () => React.useContext(SuiteTableProvider);
