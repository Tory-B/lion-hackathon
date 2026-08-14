// 실제 suyo_BE 백엔드(https://api.suyo-deploy.shop) 호출 레이어.
// mockApi.js와 동일한 함수 시그니처를 유지해 AppContext.jsx는 손대지 않고 교체할 수 있다.
// 개발 중에는 vite.config.js의 /api 프록시를 거쳐 같은 origin(/api/...)으로 호출한다
// (배포 서버가 로컬 개발 origin을 CORS로 허용하지 않기 때문).

import { getSessionId } from '../lib/session'
import { addQuestionnaireRef, getQuestionnaireRefs, saveAnalysisMeta, markAnalysisPaid } from '../lib/localMeta'
import { DISTRICTS } from '../data/districts'

class ApiError extends Error {
  constructor(code, message, status) {
    super(message)
    this.code = code
    this.status = status
  }
}

async function request(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': getSessionId(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let json
  try {
    json = await res.json()
  } catch {
    throw new ApiError('INTERNAL_ERROR', `서버 응답을 해석할 수 없습니다 (HTTP ${res.status}).`, res.status)
  }

  if (!json.success) {
    throw new ApiError(json.error?.code, json.error?.message || '요청이 실패했습니다.', res.status)
  }
  return json.data
}

// 실제 API는 layers를 배열로 내려준다 ([{layer:'MARKET',...}, ...]).
// 프론트 컴포넌트는 { market, customer, competition } 키를 기대하므로 여기서 변환한다.
function keyLayersByType(layersArray) {
  const layers = {}
  for (const l of layersArray) {
    layers[l.layer.toLowerCase()] = l
  }
  return layers
}

// ── 0. 지원 업종 조회 ──────────────────────────────
export async function getIndustries(q) {
  const query = q ? `?q=${encodeURIComponent(q)}` : ''
  return request('GET', `/industries${query}`)
}

// ── 1. 분석 요청 생성 ──────────────────────────────
export async function createAnalysis(payload) {
  const data = await request('POST', '/analyses', payload)
  // 실제 API 응답에는 지역·업종명, 결제 상태가 없어서(itemName/status만 있음) 프론트에서
  // 화면 표시용으로 로컬에 남겨둔다 (mockApi.js와 동일한 패턴).
  const district = DISTRICTS.find((d) => d.code === payload.regionSggCode)
  let paid = false
  try {
    paid = (await getDiagnosis(data.analysisId)).accessLevel === 'PAID'
  } catch {
    // 조회 실패해도 분석 생성 자체는 성공 처리한다. paid는 기본값 false로 남는다.
  }
  saveAnalysisMeta(data.analysisId, {
    districtName: district?.name ?? payload.regionSggCode,
    industryName: data.matchedIndustry?.name ?? '',
    paid,
  })
  return data
}

// ── 2. 분석 목록 조회 ──────────────────────────────
export async function listAnalyses() {
  const data = await request('GET', '/analyses?page=0&size=50')
  return { content: data.content, totalElements: data.totalElements }
}

// ── 3. 처리 상태 조회 ──────────────────────────────
export async function getAnalysisStatus(id) {
  return request('GET', `/analyses/${id}/status`)
}

// ── 4. 진단 결과 조회 ──────────────────────────────
export async function getDiagnosis(id) {
  const data = await request('GET', `/analyses/${id}/diagnosis`)
  return { ...data, layers: keyLayersByType(data.layers) }
}

// ── 5. 근거 + 미검증 가설 조회 ──────────────────────────────
export async function getEvidence(id) {
  return request('GET', `/analyses/${id}/evidence`)
}

// ── 6. 검증 질문지 생성 ──────────────────────────────
export async function createQuestionnaire(id, { hypothesisIds, type }) {
  const q = await request('POST', `/analyses/${id}/questionnaires`, { hypothesisIds, type })
  // 실제 API에는 "세션이 만든 질문지 전체 목록" 엔드포인트가 없어 프론트에서 직접 색인해둔다.
  let itemName = ''
  try {
    itemName = (await getDiagnosis(id)).itemName
  } catch {
    // 목록 표시용 부가정보일 뿐이라 실패해도 질문지 생성 자체는 성공 처리한다.
  }
  addQuestionnaireRef({
    analysisId: id,
    itemName,
    questionnaireId: q.questionnaireId,
    type: q.type,
    itemCount: q.items.length,
    createdAt: q.createdAt,
  })
  return q
}

// ── 7. 질문지 조회 ──────────────────────────────
export async function getQuestionnaire(id, questionnaireId) {
  return request('GET', `/analyses/${id}/questionnaires/${questionnaireId}`)
}

// ── 사이드바 "설문지" 메뉴용 (프론트 전용 로컬 색인 기반, 실제 API에는 없는 집계) ──────────
export async function listAllQuestionnaires() {
  return getQuestionnaireRefs()
}

// ── 10. 결제 ──────────────────────────────
export async function createPayment(id, { plan, paymentMethod }) {
  const data = await request('POST', `/analyses/${id}/payments`, { plan, paymentMethod })
  markAnalysisPaid(id)
  return data
}

// ── 11. 크레딧 조회 ──────────────────────────────
export async function getCredits() {
  return request('GET', '/credits')
}

export { ApiError }
