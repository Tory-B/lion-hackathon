// 실제 API 응답에는 진단 결과에 지역·업종명이 내려오지 않는다 (itemName만 있음).
// 프론트가 분석 요청을 만들 때 이미 알고 있는 값이므로, 백엔드 수정 없이
// 브라우저에만 analysisId 기준으로 저장해뒀다가 화면 표시에 조합해 쓴다.
const KEY_PREFIX = 'suyo_meta_'

export function saveAnalysisMeta(analysisId, meta) {
  try {
    localStorage.setItem(KEY_PREFIX + analysisId, JSON.stringify(meta))
  } catch {
    // localStorage 사용 불가 환경이면 조용히 무시 (표시만 비어 보임)
  }
}

export function getAnalysisMeta(analysisId) {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + analysisId)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function markAnalysisPaid(analysisId) {
  const meta = getAnalysisMeta(analysisId) || {}
  saveAnalysisMeta(analysisId, { ...meta, paid: true })
}
