import React from "react"

export const JobListProvider = React.createContext(null) as any

export const useProvider = () => React.useContext(JobListProvider) as any