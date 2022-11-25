import React from "react";

export const DocProvider = React.createContext(null)

export const useDocProvider = () => React.useContext(DocProvider)