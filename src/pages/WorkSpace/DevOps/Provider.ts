import { createContext, useContext } from "react";

export const DevOps = createContext<AnyType>({})

export const useDevOpsContext = () => useContext(DevOps)