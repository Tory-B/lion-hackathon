import { createContext, useCallback, useContext, useState } from 'react'
import * as api from '../api/mockApi'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [analyses, setAnalyses] = useState([])
  const [credits, setCredits] = useState({ remainingCredits: 0, expiresAt: null })

  const refreshAnalyses = useCallback(async () => {
    const { content } = await api.listAnalyses()
    setAnalyses(content)
    return content
  }, [])

  const refreshCredits = useCallback(async () => {
    const c = await api.getCredits()
    setCredits(c)
    return c
  }, [])

  const value = {
    analyses,
    credits,
    refreshAnalyses,
    refreshCredits,
    getIndustries: api.getIndustries,
    createAnalysis: api.createAnalysis,
    getAnalysisStatus: api.getAnalysisStatus,
    getDiagnosis: api.getDiagnosis,
    getEvidence: api.getEvidence,
    createQuestionnaire: api.createQuestionnaire,
    getQuestionnaire: api.getQuestionnaire,
    createPayment: api.createPayment,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp은 AppProvider 내부에서만 사용할 수 있습니다.')
  return ctx
}
