import React from "react"

export const Analysis = React.createContext<any>({
    metrics: []
})

export const useAnalysisProvider = () => React.useContext(Analysis)