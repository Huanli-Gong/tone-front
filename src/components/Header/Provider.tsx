import React from "react"

export const HeaderProvider = React.createContext<any>({
    jobTypes: [],
    jobTemplates: [],
})

export const useHeaderContext = () => React.useContext(HeaderProvider)