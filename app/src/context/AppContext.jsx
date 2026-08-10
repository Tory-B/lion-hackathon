import { createContext, useCallback, useContext, useState } from 'react'
import { generateDiagnosis, buildQuestionnaire } from '../mock/analysisEngine'

const AppContext = createContext(null)

let idCounter = 1
function nextId(prefix) {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

function seedAnalyses() {
  const seedInput = {
    itemName: 'AI 기반 반려동물 건강관리 앱',
    problem: '보호자가 반려동물의 건강 이상을 늦게 발견해 병을 키운 뒤 병원을 찾는다',
    customer: '3년 이상 반려동물을 키우는 20~40대 보호자',
    method: '모바일 앱 + 웨어러블 연동 건강 기록 서비스',
  }
  const diagnosis = generateDiagnosis(seedInput)
  return [
    {
      id: 'seed-1',
      ...seedInput,
      status: 'done',
      progressStep: 5,
      createdAt: '2026-08-05',
      diagnosis,
      questionnaires: [],
      verifications: [],
    },
  ]
}

export function AppProvider({ children }) {
  const [analyses, setAnalyses] = useState(seedAnalyses)

  const getAnalysis = useCallback(
    (id) => analyses.find((a) => a.id === id),
    [analyses],
  )

  const createAnalysis = useCallback((input) => {
    const id = nextId('an')
    const record = {
      id,
      ...input,
      status: 'processing',
      progressStep: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      diagnosis: null,
      questionnaires: [],
      verifications: [],
    }
    setAnalyses((prev) => [record, ...prev])
    return id
  }, [])

  const advanceProgress = useCallback((id) => {
    setAnalyses((prev) =>
      prev.map((a) => {
        if (a.id !== id || a.status !== 'processing') return a
        const step = Math.min(a.progressStep + 1, 5)
        if (step >= 5) {
          return {
            ...a,
            progressStep: 5,
            status: 'done',
            diagnosis: generateDiagnosis(a),
          }
        }
        return { ...a, progressStep: step }
      }),
    )
  }, [])

  const generateQuestionnaireFor = useCallback((id, { type, hypothesisIds }) => {
    let newQuestionnaireId = null
    setAnalyses((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a
        const hyps = a.diagnosis.hypotheses.filter((h) => hypothesisIds.includes(h.id))
        const q = buildQuestionnaire({ type, hypotheses: hyps, itemName: a.itemName })
        q.hypothesisIds = hypothesisIds
        newQuestionnaireId = q.id
        return { ...a, questionnaires: [...a.questionnaires, q] }
      }),
    )
    return newQuestionnaireId
  }, [])

  const getQuestionnaire = useCallback(
    (analysisId, qId) => {
      const a = analyses.find((x) => x.id === analysisId)
      return a?.questionnaires.find((q) => q.id === qId)
    },
    [analyses],
  )

  const saveVerification = useCallback((id, { questionnaireId, responses }) => {
    let result = null
    setAnalyses((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a
        const questionnaire = a.questionnaires.find((q) => q.id === questionnaireId)
        const totalResponses = responses.reduce((sum, r) => sum + (Number(r.count) || 0), 0)
        const beforeScore = a.diagnosis.layers.demand.score
        const boost = Math.min(35, Math.round(totalResponses * 2.5) + responses.length * 4)
        const afterScore = Math.max(10, beforeScore - boost)

        const verifiedHypIds = questionnaire?.hypothesisIds || []
        const updatedHypotheses = a.diagnosis.hypotheses.map((h) =>
          verifiedHypIds.includes(h.id)
            ? { ...h, status: totalResponses >= 5 ? 'verified' : 'partial' }
            : h,
        )

        const verification = {
          id: nextId('ver'),
          questionnaireId,
          responses,
          totalResponses,
          savedAt: new Date().toISOString().slice(0, 10),
          beforeScore,
          afterScore,
        }
        result = verification

        const updatedDiagnosis = {
          ...a.diagnosis,
          hypotheses: updatedHypotheses,
          layers: {
            ...a.diagnosis.layers,
            demand: {
              ...a.diagnosis.layers.demand,
              score: afterScore,
              verificationLabel:
                updatedHypotheses.filter((h) => h.status === 'unverified').length === 0
                  ? '대부분 검증됨'
                  : '일부 검증됨',
            },
          },
        }

        return {
          ...a,
          diagnosis: updatedDiagnosis,
          verifications: [...a.verifications, verification],
        }
      }),
    )
    return result
  }, [])

  const value = {
    analyses,
    getAnalysis,
    createAnalysis,
    advanceProgress,
    generateQuestionnaireFor,
    getQuestionnaire,
    saveVerification,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp은 AppProvider 내부에서만 사용할 수 있습니다.')
  return ctx
}
