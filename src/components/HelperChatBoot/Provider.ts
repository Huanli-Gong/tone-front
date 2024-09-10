import { createContext, useContext } from "react";

export const BootContext = createContext<AnyType>({})

export const useHelperBootContext = () => useContext(BootContext)