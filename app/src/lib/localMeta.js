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

// 실제 API에는 "이 세션이 만든 질문지 전체 목록" 엔드포인트가 없다 (analysisId+questionnaireId로
// 단건 조회만 가능). 사이드바 "설문지" 목록을 위해, 생성할 때마다 프론트에서 직접 색인해둔다.
const QUESTIONNAIRE_REFS_KEY = 'suyo_questionnaire_refs'

export function addQuestionnaireRef(ref) {
  try {
    const refs = getQuestionnaireRefs()
    refs.unshift(ref)
    localStorage.setItem(QUESTIONNAIRE_REFS_KEY, JSON.stringify(refs))
  } catch {
    // ignore
  }
}

export function getQuestionnaireRefs() {
  try {
    const raw = localStorage.getItem(QUESTIONNAIRE_REFS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
