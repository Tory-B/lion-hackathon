// RiskGrader.java 그대로 이식 — 등급은 저장하지 않고 조회 시 계산한다.
// 경계값은 2,395개 조합 실측 분포의 P33/P67 (2026-08-13 v3: CUSTOMER 40점/총점 100점 기준).
export const RISK_CUTS = {
  MARKET: { low: 15.6, high: 21.6 },
  CUSTOMER: { low: 18.9, high: 24.9 },
  COMPETITION: { low: 9.2, high: 14.5 },
  TOTAL: { low: 48.0, high: 57.9 },
}

export function gradeScore(layerKey, score) {
  if (score === null || score === undefined) return 'UNKNOWN'
  const { low, high } = RISK_CUTS[layerKey]
  if (score >= high) return 'LOW'
  if (score >= low) return 'MEDIUM'
  return 'HIGH'
}
