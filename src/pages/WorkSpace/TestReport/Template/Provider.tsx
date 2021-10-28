import { createContext, useContext } from 'react'

export const ReportTemplateContext = createContext<any>(null)

export const useProvider = () => useContext(ReportTemplateContext)