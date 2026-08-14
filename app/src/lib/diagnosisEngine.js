// 실제 백엔드(suyo_BE)의 DiagnosisScorer.java / AnalysisService.java를 그대로 옮긴 mock 진단 생성기.
// 지표 점수 = (서울 분포에서의 백분위 순위 / 100) × 지표 배점. 점수는 소수점을 가질 수 있다.
import { gradeScore } from './riskGrader'

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

function scorePoint(rand, weight) {
  const upperPercent = Math.round(5 + rand() * 90) // 서울 상위 5%~95%
  const earned = round1(weight * (1 - upperPercent / 100))
  return { upperPercent, earned }
}

// DiagnosisScorer.java 그대로: L1=시장규모10+5년CAGR15+최근모멘텀5, L2=성별쏠림7+연령쏠림7+실수요증가율11+소비패턴안정성15,
// L3=지역내동종업소수15+업종5년생존율15
const LAYER_NAME = { MARKET: '시장 규모·성장률', CUSTOMER: '고객(타겟)', COMPETITION: '경쟁' }
const DATA_SCOPE = {
  MARKET: '서울시 전체 집계 (자치구 단위 아님)',
  CUSTOMER: '서울 기준 업종 벤치마크',
  COMPETITION: '해당 지역 실측',
}
const SUMMARY_TEMPLATE = {
  LOW: (name) => `${name} 지표가 서울 평균보다 나은 편입니다.`,
  MEDIUM: (name) => `${name} 지표가 서울 평균과 비슷한 수준입니다.`,
  HIGH: (name) => `${name} 지표가 서울 평균보다 위험한 편입니다.`,
}

function scoreMarket(rand) {
  const size = scorePoint(rand, 10)
  const cagr = scorePoint(rand, 15)
  const momentum = scorePoint(rand, 5)
  const score = round1(size.earned + cagr.earned + momentum.earned)
  const marketSizeAmount = Math.round(3000 + rand() * 30000)
  const cagrPercent = round1(-3 + rand() * 10)
  const momentumPercent = round1(-2 + rand() * 6)
  const factors = [
    {
      factor: '시장 규모(최근 4분기 매출)',
      value: `${(marketSizeAmount * 100_000_000).toLocaleString()}원`,
      percentile: `서울 상위 ${size.upperPercent}%`,
      storeCount: null,
      source: '서울시 상권분석서비스',
      referenceDate: '최근 4분기',
      confidenceStatus: 'CONFIRMED',
    },
    {
      factor: '5년 연평균 성장률(CAGR)',
      value: `${cagrPercent >= 0 ? '+' : ''}${cagrPercent.toFixed(1)}%`,
      percentile: `서울 상위 ${cagr.upperPercent}%`,
      storeCount: null,
      source: '서울시 상권분석서비스',
      referenceDate: '2021~2026',
      confidenceStatus: 'CONFIRMED',
    },
    {
      factor: '최근 모멘텀(최근1년-CAGR)',
      value: `${momentumPercent >= 0 ? '+' : ''}${momentumPercent.toFixed(1)}%`,
      percentile: `서울 상위 ${momentum.upperPercent}%`,
      storeCount: null,
      source: '서울시 상권분석서비스',
      referenceDate: '최근 1년',
      confidenceStatus: 'CONFIRMED',
    },
  ]
  return { score, maxScore: 30, factors }
}

function scoreCustomer(rand) {
  const gender = scorePoint(rand, 7)
  const age = scorePoint(rand, 7)
  const demand = scorePoint(rand, 11)
  const weekend = scorePoint(rand, 15)
  const score = round1(gender.earned + age.earned + demand.earned + weekend.earned)
  const genderPercent = round1(30 + rand() * 40)
  const agePercent = round1(15 + rand() * 30)
  const demandPercent = round1(-3 + rand() * 10)
  const weekendPercent = round1(30 + rand() * 40)
  const factors = [
    {
      factor: '성별 쏠림',
      value: `${genderPercent.toFixed(1)}%`,
      percentile: `서울 상위 ${gender.upperPercent}%`,
      storeCount: null,
      source: '서울시 상권분석서비스',
      referenceDate: '최근 분기',
      confidenceStatus: 'CONFIRMED',
    },
    {
      factor: '연령 쏠림',
      value: `${agePercent.toFixed(1)}%`,
      percentile: `서울 상위 ${age.upperPercent}%`,
      storeCount: null,
      source: '서울시 상권분석서비스',
      referenceDate: '최근 분기',
      confidenceStatus: 'CONFIRMED',
    },
    {
      factor: '실수요 증가율(매출건수 CAGR)',
      value: `${demandPercent >= 0 ? '+' : ''}${demandPercent.toFixed(1)}%`,
      percentile: `서울 상위 ${demand.upperPercent}%`,
      storeCount: null,
      source: '서울시 상권분석서비스',
      referenceDate: '2021~2026',
      confidenceStatus: 'CONFIRMED',
    },
    {
      factor: '소비패턴 안정성(주말비중)',
      value: `${weekendPercent.toFixed(1)}%`,
      percentile: `서울 상위 ${weekend.upperPercent}%`,
      storeCount: null,
      source: '서울시 상권분석서비스',
      referenceDate: '최근 분기',
      confidenceStatus: 'CONFIRMED',
    },
  ]
  return { score, maxScore: 40, factors }
}

function scoreCompetition(rand) {
  const storeCount = Math.round(5 + rand() * 700)
  const lowSample = storeCount < 10
  const survival5y = round1(20 + rand() * 55)

  let densityEarned
  let densityPercentileText
  let densityConfidence
  if (lowSample) {
    densityEarned = round1(15 * 0.5)
    densityPercentileText = `표본 적음(점포 ${storeCount}개)`
    densityConfidence = 'LOW_SAMPLE'
  } else {
    const density = scorePoint(rand, 15)
    densityEarned = density.earned
    densityPercentileText = `서울 상위 ${density.upperPercent}%`
    densityConfidence = 'CONFIRMED'
  }
  const survival = scorePoint(rand, 15)
  const score = round1(densityEarned + survival.earned)

  const factors = [
    {
      factor: '지역 내 동종 업소 수',
      value: `${storeCount}개`,
      percentile: densityPercentileText,
      storeCount,
      source: '소상공인시장진흥공단 상가정보',
      referenceDate: '2026년 6월',
      confidenceStatus: densityConfidence,
    },
    {
      factor: '업종 5년 생존율',
      value: `${survival5y}%`,
      percentile: `서울 상위 ${survival.upperPercent}%`,
      storeCount: null,
      source: '국가데이터처 기업생멸행정통계',
      referenceDate: '2023p',
      confidenceStatus: 'CONFIRMED',
    },
  ]
  return { score, maxScore: 30, factors }
}

// AnalysisService.buildVerdict()와 동일한 규칙.
function buildVerdict(market, customer, competition) {
  const risks = [
    { name: LAYER_NAME.MARKET, level: gradeScore('MARKET', market.score) },
    { name: LAYER_NAME.CUSTOMER, level: gradeScore('CUSTOMER', customer.score) },
    { name: LAYER_NAME.COMPETITION, level: gradeScore('COMPETITION', competition.score) },
  ]
  const notLow = risks.filter((r) => r.level !== 'LOW')
  if (notLow.length === 0) return '전반적으로 서울 평균보다 양호합니다'
  const riskText = (level) => (level === 'HIGH' ? '위험' : '보통')
  if (notLow.length === 1) {
    return `${notLow[0].name} ${riskText(notLow[0].level)} — 나머지는 양호`
  }
  return notLow.map((r) => `${r.name} ${riskText(r.level)}`).join(', ')
}

function toLayerResponse(layerKey, built) {
  const riskLevel = gradeScore(layerKey, built.score)
  return {
    layer: layerKey,
    layerName: LAYER_NAME[layerKey],
    score: built.score,
    maxScore: built.maxScore,
    riskLevel,
    dataScope: DATA_SCOPE[layerKey],
    summary: SUMMARY_TEMPLATE[riskLevel](LAYER_NAME[layerKey]),
    factors: built.factors,
  }
}

export function generateDiagnosis({ itemName, industryCode, problem, targetCustomer, districtCode }) {
  const seed = hashString(itemName + industryCode + districtCode + problem)
  const rand = seededRandom(seed)

  const marketBuilt = scoreMarket(rand)
  const customerBuilt = scoreCustomer(rand)
  const competitionBuilt = scoreCompetition(rand)

  const market = toLayerResponse('MARKET', marketBuilt)
  const customer = toLayerResponse('CUSTOMER', customerBuilt)
  const competition = toLayerResponse('COMPETITION', competitionBuilt)

  const totalScore = round1(market.score + customer.score + competition.score)
  const totalRisk = gradeScore('TOTAL', totalScore)
  const verdict = buildVerdict(market, customer, competition)

  const confirmedEvidences = [market, customer, competition].flatMap((l) =>
    l.factors
      .filter((f) => f.confidenceStatus === 'CONFIRMED')
      .map((f) => ({ layer: l.layer, factor: f.factor, value: f.value, source: f.source, referenceDate: f.referenceDate })),
  )

  // AnalysisService.create()와 동일: CUSTOMER 레이어에 고정 2개 가설만 생성.
  const unverifiedHypotheses = [
    { hypothesisId: 1, layer: 'CUSTOMER', description: `"${problem}"이(가) 실제 구매로 이어지는지 아직 검증되지 않았습니다.`, needsVerification: true },
    { hypothesisId: 2, layer: 'CUSTOMER', description: `"${targetCustomer}"이(가) 비용을 지불할 의사가 있는지 아직 검증되지 않았습니다.`, needsVerification: true },
  ]

  return {
    itemName,
    totalScore,
    totalRisk,
    verdict,
    dataCoverage: 'FULL',
    aiSummary: null,
    layers: { market, customer, competition },
    confirmedEvidences,
    unverifiedHypotheses,
  }
}
