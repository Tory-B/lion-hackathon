// VITE_USE_REAL_API=true 이면 실제 배포된 백엔드(https://api.suyo-deploy.shop, vite 프록시 경유)를
// 쓰고, 아니면 기존처럼 mock을 쓴다. .env.local에서 설정 (README 참고).
import * as mock from './mockApi'
import * as real from './realApi'

const useReal = import.meta.env.VITE_USE_REAL_API === 'true'
const impl = useReal ? real : mock

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info(`[suyo] API 모드: ${useReal ? 'REAL (api.suyo-deploy.shop)' : 'MOCK'}`)
}

export const getIndustries = impl.getIndustries
export const createAnalysis = impl.createAnalysis
export const listAnalyses = impl.listAnalyses
export const getAnalysisStatus = impl.getAnalysisStatus
export const getDiagnosis = impl.getDiagnosis
export const getEvidence = impl.getEvidence
export const createQuestionnaire = impl.createQuestionnaire
export const getQuestionnaire = impl.getQuestionnaire
export const listAllQuestionnaires = impl.listAllQuestionnaires
export const createPayment = impl.createPayment
export const getCredits = impl.getCredits
export const ApiError = impl.ApiError
