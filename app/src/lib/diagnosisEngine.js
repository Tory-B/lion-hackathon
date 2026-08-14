// API 명세서 "부록 · 점수와 등급 해석"을 그대로 반영한 mock 진단 생성기.
// 지표 점수 = (1 - 상위백분위/100) × 배점. 점수는 소수점을 가질 수 있다.

function seededRandom(seed) {
  let value = seed % 2147483647
  if (value <= 0) value += 2147483646
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) || 1
}

function round1(n) {
  return Math.round(n * 10) / 10
}

// riskLevel 경계값 (API 명세서 부록 그대로)
const THRESHOLDS = {
  MARKET: { high: 15.6, medium: 21.6 },
  CUSTOMER: { high: 18.9, medium: 24.9 },
  COMPETITION: { high: 9.2, medium: 14.5 },
  TOTAL: { high: 48.0, medium: 57.9 },
}

function riskLevelOf(layer, score) {
  const t = THRESHOLDS[layer]
  if (score < t.high) return 'HIGH'
  if (score < t.medium) return 'MEDIUM'
  return 'LOW'
}

function scoreIndicator(rand, weight) {
  const topPercent = Math.round(5 + rand() * 90) // 상위 5%~95%
  const earned = round1(weight * (1 - topPercent / 100))
  return { topPercent, earned }
}

const MARKET_INDICATORS = [
  { key: 'marketSize', label: '시장 규모', weight: 10 },
  { key: 'momentum', label: '최근 모멘텀', weight: 8 },
  { key: 'demandGrowth', label: '실수요 증가율', weight: 7 },
  { key: 'consumptionStability', label: '소비패턴 안정성', weight: 5 },
]

const CUSTOMER_INDICATORS = [
  { key: 'genderSpread', label: '성별 분산', weight: 7 },
  { key: 'ageSpread', label: '연령 분산', weight: 7 },
  { key: 'demandGrowthRate', label: '실수요 증가율', weight: 11 },
  { key: 'spendingStability', label: '소비패턴 안정성', weight: 15 },
]

const COMPETITION_INDICATORS = [
  { key: 'storeCount', label: '점포 수', weight: 8 },
  { key: 'density', label: '경쟁 밀도', weight: 8 },
  { key: 'salesPerStore', label: '점포당 분기매출', weight: 7 },
  { key: 'survivalRate', label: '업종 3년 생존율', weight: 7 },
]

function buildLayer(layerKey, layerName, indicators, rand, storeCount) {
  const rows = indicators.map((ind) => {
    const { topPercent, earned } = scoreIndicator(rand, ind.weight)
    const lowSample = ind.key === 'density' && storeCount < 10
    return {
      ...ind,
      topPercent,
      earned,
      confidenceStatus: lowSample ? 'LOW_SAMPLE' : 'CONFIRMED',
    }
  })
  const score = round1(rows.reduce((sum, r) => sum + r.earned, 0))
  return {
    layer: layerKey,
    layerName,
    score,
    maxScore: indicators.reduce((s, i) => s + i.weight, 0),
    riskLevel: riskLevelOf(layerKey, score),
    indicators: rows,
  }
}

const RISK_LABEL = { LOW: '서울 평균보다 나은 편', MEDIUM: '서울 평균과 비슷한 편', HIGH: '서울 평균보다 낮은 편' }

export function generateDiagnosis({ itemName, industry, problem, targetCustomer, district }) {
  const seed = hashString(itemName + industry.industryCode + district.code + problem)
  const rand = seededRandom(seed)

  const storeCount = Math.round(30 + rand() * 700)

  const market = buildLayer('MARKET', '시장 규모·성장률', MARKET_INDICATORS, rand, storeCount)
  const customer = buildLayer('CUSTOMER', '고객(타겟)', CUSTOMER_INDICATORS, rand, storeCount)
  const competition = buildLayer('COMPETITION', '경쟁', COMPETITION_INDICATORS, rand, storeCount)
  competition.storeCount = storeCount

  const totalScore = round1(market.score + customer.score + competition.score)
  const totalRisk = riskLevelOf('TOTAL', totalScore)

  const layers = [market, customer, competition]
  const worst = [...layers].sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 }
    return order[a.riskLevel] - order[b.riskLevel]
  })[0]

  const verdict = `${worst.layerName} ${RISK_LABEL[worst.riskLevel]} — 나머지는 양호`

  const marketSizeAmount = Math.round(3000 + rand() * 30000) // 억원
  const cagr = round1(-3 + rand() * 10)
  const avgPayment = Math.round(4000 + rand() * 15000)
  const survival = round1(20 + rand() * 55)
  const density = round1(storeCount / (10 + rand() * 20))

  const confirmedEvidences = [
    {
      layer: 'MARKET',
      factor: '시장 규모',
      value: `연 ${marketSizeAmount.toLocaleString()}억원`,
      percentile: `서울 63개 업종 중 상위 ${market.indicators[0].topPercent}%`,
      source: '서울시 상권분석서비스',
      referenceDate: '2026년 1분기',
    },
    {
      layer: 'MARKET',
      factor: '최근 5년 연평균 성장률',
      value: `${cagr >= 0 ? '+' : ''}${cagr}%`,
      percentile: `서울 상위 ${market.indicators[1].topPercent}%`,
      source: '서울시 상권분석서비스',
      referenceDate: '2021~2026',
    },
    {
      layer: 'CUSTOMER',
      factor: '건당 평균 결제액',
      value: `${avgPayment.toLocaleString()}원`,
      percentile: `서울 상위 ${customer.indicators[2].topPercent}%`,
      source: '서울시 상권분석서비스',
      referenceDate: '2026년 1분기',
    },
    {
      layer: 'COMPETITION',
      factor: '지역 내 동종 업소 수',
      value: `${storeCount}개`,
      source: '소상공인시장진흥공단 상가정보',
      referenceDate: '2026년 6월',
    },
    {
      layer: 'COMPETITION',
      factor: '업종 3년 생존율',
      value: `${survival}%`,
      percentile: `전산업 평균 대비 ${survival >= 45 ? '상회' : '하회'}`,
      source: '국가데이터처 기업생멸행정통계',
      referenceDate: '2023p',
    },
  ]

  const hypothesesPool = [
    { layer: 'CUSTOMER', description: `${targetCustomer || '주 타겟 고객'}이 "${problem}"을 얼마나 자주 겪는지는 데이터로 확인되지 않습니다.` },
    { layer: 'CUSTOMER', description: `실제로 비용을 지불할 의사가 있는지는 아직 확인되지 않았습니다.` },
    { layer: 'CUSTOMER', description: `기존 대안 대비 "${itemName}"을 선택할 이유가 명확한지 확인이 필요합니다.` },
    { layer: 'MARKET', description: `최근 1년 성장 정체가 일시적인지 추세 전환인지는 추가 확인이 필요합니다.` },
  ]

  const unverifiedHypotheses = hypothesesPool.map((h, idx) => ({
    hypothesisId: idx + 1,
    layer: h.layer,
    description: h.description,
    needsVerification: true,
  }))

  return {
    itemName,
    totalScore,
    totalRisk,
    verdict,
    dataCoverage: 'FULL',
    aiSummary: `시장은 5년간 ${cagr >= 0 ? '꾸준히 커졌지만' : '정체됐고'} 최근 1년은 ${cagr >= 0 && market.indicators[1].earned < market.indicators[1].weight * 0.5 ? '성장이 둔화됐고' : '흐름이 이어지고 있고'}, ${district.name}은 경쟁 밀도가 서울 평균 ${density >= 15 ? '이상' : '이하'}입니다. 종합 판정은 '${worst.layerName}' 레이어가 상대적으로 가장 낮은 등급이라 그렇게 매겨졌습니다.`,
    layers: { market, customer, competition },
    confirmedEvidences,
    unverifiedHypotheses,
    meta: { district, industry, storeCount, density: round1(density) },
  }
}
