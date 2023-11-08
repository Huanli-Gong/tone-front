import { createContext, useContext } from 'react'

export const ReportContext = createContext<any>(null)

export const useReportContext = () => useContext(ReportContext)