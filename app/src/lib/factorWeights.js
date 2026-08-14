// 실제 API의 factors[]에는 배점·획득점수 숫자가 없다 (factor/value/percentile 텍스트만 온다).
// DiagnosisScorer.java에 하드코딩된 지표별 배점을 그대로 옮겨와, 화면의 "산출 근거" 표를
// factor 이름 + percentile 텍스트만으로 재구성한다. 배점이 바뀌면 이 표도 같이 갱신해야 한다.
export const FACTOR_WEIGHTS = {
  '시장 규모(최근 4분기 매출)': 10,
  '5년 연평균 성장률(CAGR)': 15,
  '최근 모멘텀(최근1년-CAGR)': 5,
  '성별 쏠림': 7,
  '연령 쏠림': 7,
  '실수요 증가율(매출건수 CAGR)': 11,
  '소비패턴 안정성(주말비중)': 15,
  '지역 내 동종 업소 수': 15,
  '업종 5년 생존율': 15,
}

// percentile 텍스트 "서울 상위 23%" → 23. LOW_SAMPLE인 "표본 적음(점포 12개)" 같은 텍스트는 매칭 안 됨(null).
export function parseUpperPercent(percentileText) {
  if (!percentileText) return null
  const match = percentileText.match(/상위\s*(\d+)%/)
  return match ? Number(match[1]) : null
}

// 획득점수 = 배점 × (1 - 상위%/100). LOW_SAMPLE 지표는 배점의 50%로 고정 (DiagnosisScorer.java와 동일).
export function computeEarned(factor) {
  const weight = FACTOR_WEIGHTS[factor.factor]
  if (weight === undefined) return null
  if (factor.confidenceStatus === 'LOW_SAMPLE') {
    return { weight, earned: Math.round(weight * 0.5 * 10) / 10, upperPercent: null }
  }
  const upperPercent = parseUpperPercent(factor.percentile)
  if (upperPercent === null) return { weight, earned: null, upperPercent: null }
  const earned = Math.round(weight * (1 - upperPercent / 100) * 10) / 10
  return { weight, earned, upperPercent }
}
