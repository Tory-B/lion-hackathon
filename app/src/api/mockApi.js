// API 명세서(notion) 계약을 그대로 흉내 낸 목업 레이어.
// 실제 백엔드(BE 팀 레포, base URL http://localhost:8080)로 교체할 때
// 이 파일의 함수 시그니처/반환 형태만 유지하면 호출부(AppContext)는 그대로 쓸 수 있다.

import { generateDiagnosis } from '../lib/diagnosisEngine'
import { buildQuestionnaire } from '../lib/questionnaireEngine'
import { getSessionId } from '../lib/session'
import { saveAnalysisMeta, markAnalysisPaid } from '../lib/localMeta'
import { ALL_INDUSTRIES, INDUSTRY_GROUPS } from '../data/industries'
import { DISTRICTS } from '../data/districts'

const DELAY = 350

function delay(ms = DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

class ApiError extends Error {
  constructor(code, message, status) {
    super(message)
    this.code = code
    this.status = status
  }
}

// ── 세션별 인메모리 저장소 ──────────────────────────────
const db = {
  analyses: new Map(), // analysisId -> record
  credits: { remainingCredits: 0, expiresAt: null },
}
let analysisIdSeq = 1

function nowIso() {
  return new Date().toISOString()
}

function hasValidCredit() {
  if (!db.credits.expiresAt) return db.credits.remainingCredits > 0
  return db.credits.remainingCredits > 0 && new Date(db.credits.expiresAt) > new Date()
}

// ── 0. 지원 업종 조회 ──────────────────────────────
export async function getIndustries(q) {
  await delay(150)
  if (!q) {
    return { groups: INDUSTRY_GROUPS }
  }
  const query = q.trim().toLowerCase()
  const groups = INDUSTRY_GROUPS.map((g) => ({
    ...g,
    industries: g.industries.filter((i) => i.industryName.toLowerCase().includes(query)),
  })).filter((g) => g.industries.length > 0)
  return { groups }
}

// ── 1. 분석 요청 생성 ──────────────────────────────
export async function createAnalysis(payload) {
  await delay(600)
  const { itemName, industryCode, problem, targetCustomer, deliveryMethod, regionSggCode } = payload

  if (!itemName || !industryCode || !problem || !targetCustomer || !deliveryMethod || !regionSggCode) {
    throw new ApiError('VALIDATION_ERROR', '필수 입력값이 누락되었습니다.', 400)
  }

  const industry = ALL_INDUSTRIES.find((i) => i.industryCode === industryCode)
  const district = DISTRICTS.find((d) => d.code === regionSggCode)
  if (!industry) throw new ApiError('INDUSTRY_NOT_SUPPORTED', '지원하지 않는 업종입니다.', 422)
  if (!district) throw new ApiError('REGION_NOT_SUPPORTED', '서울 25개 자치구 외 지역입니다.', 422)

  const analysisId = analysisIdSeq++
  const diagnosis = generateDiagnosis({
    itemName,
    industryCode: industry.industryCode,
    districtCode: district.code,
    problem,
    targetCustomer,
  })

  const autoCredit = hasValidCredit()
  if (autoCredit) {
    db.credits.remainingCredits -= 1
  }

  const record = {
    analysisId,
    itemName,
    industry,
    district,
    problem,
    targetCustomer,
    deliveryMethod,
    status: 'PENDING',
    paymentStatus: autoCredit ? 'PAID' : 'FREE',
    diagnosis,
    questionnaires: [],
    createdAt: nowIso(),
    sessionId: getSessionId(),
  }
  db.analyses.set(analysisId, record)

  // 실제 API 응답에는 지역·업종명이 없어서(itemName만 옴), 화면 표시용으로 로컬에만 남겨둔다.
  saveAnalysisMeta(analysisId, {
    districtName: district.name,
    industryName: industry.industryName,
    paid: autoCredit,
  })

  // 진행중 폴링용 단계 메시지를 남겨두고, 곧 COMPLETED로 전환
  record._steps = [
    '시장 데이터를 조회하고 있습니다',
    '고객(타겟) 데이터를 조회하고 있습니다',
    '경쟁 데이터를 조회하고 있습니다',
    '종합 점수를 계산하고 있습니다',
  ]
  record._stepIndex = 0
  record.status = 'IN_PROGRESS'
  setTimeout(() => {
    record.status = 'COMPLETED'
  }, 2400)
  const stepTimer = setInterval(() => {
    record._stepIndex += 1
    if (record._stepIndex >= record._steps.length) clearInterval(stepTimer)
  }, 600)

  return {
    analysisId,
    status: record.status,
    matchedIndustry: { code: industry.industryCode, name: industry.industryName, matchAccuracy: 'EXACT' },
    diagnosisUrl: `/api/analyses/${analysisId}/diagnosis`,
    createdAt: record.createdAt,
  }
}

// ── 2. 분석 목록 조회 ──────────────────────────────
export async function listAnalyses() {
  await delay(200)
  const sessionId = getSessionId()
  const content = [...db.analyses.values()]
    .filter((a) => a.sessionId === sessionId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((a) => ({
      // AnalysisListItemResponse.java와 동일한 필드만 (industryName/districtName/paymentStatus 없음)
      analysisId: a.analysisId,
      itemName: a.itemName,
      status: a.status,
      totalScore: a.status === 'COMPLETED' ? a.diagnosis.totalScore : null,
      verdict: a.status === 'COMPLETED' ? a.diagnosis.verdict : null,
      createdAt: a.createdAt,
    }))
  return { content, totalElements: content.length }
}

// ── 3. 처리 상태 조회 ──────────────────────────────
export async function getAnalysisStatus(id) {
  await delay(150)
  const record = mustGet(id)
  const idx = Math.min(record._stepIndex ?? 0, record._steps.length - 1)
  return {
    analysisId: id,
    status: record.status,
    progressMessage: record.status === 'COMPLETED' ? '완료되었습니다' : record._steps[idx],
    stepIndex: record._stepIndex ?? 0,
    stepCount: record._steps.length,
  }
}

// ── 4. 진단 결과 조회 ──────────────────────────────
export async function getDiagnosis(id) {
  await delay(250)
  const record = mustGet(id)
  if (record.status !== 'COMPLETED') {
    throw new ApiError('ANALYSIS_NOT_COMPLETED', '진단이 아직 끝나지 않았습니다.', 409)
  }
  const paid = record.paymentStatus === 'PAID'
  // AnalysisService.toLayerResponse(): FREE면 factors/summary를 아예 내려주지 않는다 (블러가 아니라 미전송).
  const gate = (layer) => (paid ? layer : { ...layer, summary: null, factors: null })

  return {
    analysisId: id,
    itemName: record.itemName,
    totalScore: record.diagnosis.totalScore,
    verdict: record.diagnosis.verdict,
    accessLevel: paid ? 'PAID' : 'FREE',
    aiSummary: record.diagnosis.aiSummary,
    dataCoverage: record.diagnosis.dataCoverage,
    layers: {
      market: gate(record.diagnosis.layers.market),
      customer: gate(record.diagnosis.layers.customer),
      competition: gate(record.diagnosis.layers.competition),
    },
    createdAt: record.createdAt,
  }
}

// ── 5. 근거 + 미검증 가설 조회 ──────────────────────────────
export async function getEvidence(id) {
  await delay(200)
  const record = mustGet(id)
  return {
    analysisId: id,
    confirmedEvidences: record.diagnosis.confirmedEvidences,
    unverifiedHypotheses: record.diagnosis.unverifiedHypotheses,
  }
}

// ── 6. 검증 질문지 생성 ──────────────────────────────
export async function createQuestionnaire(id, { hypothesisIds, type }) {
  await delay(700)
  const record = mustGet(id)
  if (record.paymentStatus !== 'PAID') {
    throw new ApiError('PAYMENT_REQUIRED', '결제가 필요합니다.', 402)
  }
  if (!hypothesisIds || hypothesisIds.length === 0) {
    throw new ApiError('NO_HYPOTHESIS', '생성할 미검증 가설이 없습니다.', 409)
  }
  const hypotheses = record.diagnosis.unverifiedHypotheses.filter((h) =>
    hypothesisIds.includes(h.hypothesisId),
  )
  const questionnaire = buildQuestionnaire({ hypotheses, itemName: record.itemName, type })
  record.questionnaires.push(questionnaire)
  return questionnaire
}

// ── 7. 질문지 조회 ──────────────────────────────
export async function getQuestionnaire(id, questionnaireId) {
  await delay(150)
  const record = mustGet(id)
  const q = record.questionnaires.find((qq) => String(qq.questionnaireId) === String(questionnaireId))
  if (!q) throw new ApiError('NOT_FOUND', '질문지를 찾을 수 없습니다.', 404)
  return q
}

// ── 10. 결제 (목업) ──────────────────────────────
export async function createPayment(id, { plan, paymentMethod }) {
  await delay(900)
  const record = mustGet(id)
  const amount = plan === 'PACK3' ? 24900 : 9900
  record.paymentStatus = 'PAID'
  markAnalysisPaid(id)

  let remainingCredits = 0
  let expiresAt = null
  if (plan === 'PACK3') {
    const expires = new Date()
    expires.setMonth(expires.getMonth() + 6)
    expiresAt = expires.toISOString()
    db.credits.remainingCredits += 2
    db.credits.expiresAt = expiresAt
    remainingCredits = db.credits.remainingCredits
  }

  return {
    analysisId: id,
    unlocked: true,
    plan,
    amount,
    paymentMethod,
    remainingCredits,
    expiresAt,
  }
}

// ── 11. 크레딧 조회 ──────────────────────────────
export async function getCredits() {
  await delay(120)
  if (!hasValidCredit()) return { remainingCredits: 0, expiresAt: null }
  return { ...db.credits }
}

function mustGet(id) {
  const record = db.analyses.get(Number(id))
  if (!record) throw new ApiError('NOT_FOUND', '해당 분석을 찾을 수 없습니다.', 404)
  return record
}

export { ApiError }
