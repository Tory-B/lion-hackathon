// 아이템 입력값을 바탕으로 mock 리스크 진단 데이터를 생성한다.
// 실제 데이터 수집/분석 로직이 없는 프론트엔드 프로토타입이므로,
// 입력값 해시를 시드로 사용해 같은 아이템이면 같은 결과가 나오도록 한다.

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

function levelOf(score) {
  if (score >= 70) return { label: '높음', tone: 'high' }
  if (score >= 40) return { label: '보통', tone: 'mid' }
  return { label: '낮음', tone: 'low' }
}

const MARKET_FACTOR_TEMPLATES = [
  (name) => `"${name}"이 속한 시장의 최근 검색·언급 추세가 뚜렷한 증가세를 보이지 않습니다.`,
  (name) => `관련 산업 리포트에서 시장 규모 성장률이 완만한 것으로 나타납니다.`,
  (name) => `유사 카테고리 제품의 온라인 언급량이 계절적 변동에 크게 좌우됩니다.`,
]
const COMPETITION_FACTOR_TEMPLATES = [
  (name) => `"${name}"과 유사한 서비스가 이미 다수 존재해 차별화 지점이 명확히 드러나지 않습니다.`,
  (name) => `상위 경쟁사 대비 가격·기능 비교 데이터가 충분히 확보되지 않았습니다.`,
  (name) => `진입 장벽이 낮은 카테고리로 분류되어 후발 경쟁자의 진입 가능성이 있습니다.`,
]
const TIMING_FACTOR_TEMPLATES = [
  (name) => `관련 키워드 검색량이 최근 12개월간 완만한 하락세를 보입니다.`,
  (name) => `유사 아이템의 크라우드펀딩 성공 사례가 최근 1년 내 일부 확인됩니다.`,
  (name) => `정책·규제 변화가 최근 발표되어 시장 진입 시점에 영향을 줄 수 있습니다.`,
]
const DEMAND_FACTOR_TEMPLATES = [
  (name) => `"${name}"과 동일한 문제를 다룬 크라우드펀딩·베타 서비스의 실거래 데이터가 확인되지 않습니다.`,
  (name) => `검색량은 존재하나 이를 실제 지출로 연결하는 거래 데이터가 부족합니다.`,
  (name) => `유사 사례 중 실패로 종료된 프로젝트 비중이 낮지 않아 수요 확신도가 낮습니다.`,
]

const HYPOTHESIS_TEMPLATES = [
  (name, customer) => ({
    title: `${customer || '예상 고객'}이 이 문제를 실제로 반복적으로 겪는가`,
    description: `"${name}"이 해결하려는 문제가 ${customer || '예상 고객'}에게 얼마나 자주, 얼마나 심각하게 발생하는지는 데이터로 확인되지 않았습니다.`,
  }),
  (name, customer) => ({
    title: `${customer || '예상 고객'}이 현재 대안에 실제 비용을 지출하고 있는가`,
    description: `현재 문제를 해결하기 위해 ${customer || '예상 고객'}이 시간이나 돈을 쓰고 있다는 근거가 부족합니다.`,
  }),
  (name) => ({
    title: `제공 방식이 구매·이용 결정에 실제 영향을 주는가`,
    description: `"${name}"의 제공 방식(채널, 가격, 형태)이 실제 구매 결정 요인인지는 검증되지 않았습니다.`,
  }),
  (name, customer) => ({
    title: `${customer || '예상 고객'}이 대안을 스스로 찾아본 경험이 있는가`,
    description: `${customer || '예상 고객'}이 유사한 문제 해결을 위해 능동적으로 검색·비교해본 행동 근거가 확인되지 않았습니다.`,
  }),
]

export function generateDiagnosis(input) {
  const seedBase = hashString(input.itemName + input.problem)
  const rand = seededRandom(seedBase)

  const marketScore = Math.round(30 + rand() * 40)
  const competitionScore = Math.round(30 + rand() * 45)
  const timingScore = Math.round(25 + rand() * 40)
  const demandScore = Math.round(45 + rand() * 40)

  // 스펙 상 수요 레이어에 최대 배점 (가중치 높음)
  const composite = Math.round(
    marketScore * 0.2 + competitionScore * 0.2 + timingScore * 0.2 + demandScore * 0.4,
  )

  const buildFactors = (templates, count) =>
    templates.slice(0, count).map((tpl, idx) => ({
      id: `factor-${idx}`,
      title: tpl(input.itemName, input.customer),
      reliability: rand() > 0.75 ? 'low' : 'normal',
    }))

  const marketFactors = buildFactors(MARKET_FACTOR_TEMPLATES, 2)
  const competitionFactors = buildFactors(COMPETITION_FACTOR_TEMPLATES, 2)
  const timingFactors = buildFactors(TIMING_FACTOR_TEMPLATES, 2)
  const demandFactors = buildFactors(DEMAND_FACTOR_TEMPLATES, 3)

  const asOf = '2026-08-10'
  const evidence = [
    ...marketFactors.map((f, i) => ({
      id: `ev-market-${i}`,
      layer: 'market',
      factorTitle: f.title,
      source: '네이버 데이터랩 검색량 지표',
      asOf,
      reliability: f.reliability,
    })),
    ...competitionFactors.map((f, i) => ({
      id: `ev-competition-${i}`,
      layer: 'competition',
      factorTitle: f.title,
      source: '유사 서비스 목록 및 앱스토어 순위 데이터',
      asOf,
      reliability: f.reliability,
    })),
    ...timingFactors.map((f, i) => ({
      id: `ev-timing-${i}`,
      layer: 'timing',
      factorTitle: f.title,
      source: '검색 트렌드 및 크라우드펀딩 플랫폼 공개 데이터',
      asOf,
      reliability: f.reliability,
    })),
    ...demandFactors.map((f, i) => ({
      id: `ev-demand-${i}`,
      layer: 'demand',
      factorTitle: f.title,
      source: '크라우드펀딩·커머스 플랫폼 거래 데이터 (있는 경우)',
      asOf,
      reliability: f.reliability,
    })),
  ]

  const hypotheses = HYPOTHESIS_TEMPLATES.map((tpl, idx) => {
    const h = tpl(input.itemName, input.customer)
    return {
      id: `hyp-${idx}`,
      title: h.title,
      description: h.description,
      needsVerification: true,
      status: 'unverified',
    }
  })

  return {
    compositeScore: composite,
    compositeLevel: levelOf(composite),
    layers: {
      market: { key: 'market', label: '시장', score: marketScore, level: levelOf(marketScore), factors: marketFactors },
      competition: { key: 'competition', label: '경쟁', score: competitionScore, level: levelOf(competitionScore), factors: competitionFactors },
      timing: { key: 'timing', label: '타이밍', score: timingScore, level: levelOf(timingScore), factors: timingFactors },
      demand: {
        key: 'demand',
        label: '수요',
        score: demandScore,
        level: levelOf(demandScore),
        verificationLabel: demandScore >= 60 ? '대부분 미검증' : '일부 미검증',
        factors: demandFactors,
      },
    },
    evidence,
    hypotheses,
  }
}

export function buildQuestionnaire({ type, hypotheses, itemName }) {
  const purposeMap = {
    interview: '인터뷰',
    survey: '설문',
  }
  const items = hypotheses.flatMap((h) => [
    {
      id: `${h.id}-past`,
      question: `최근에 "${h.title.replace(/[?]/g, '')}"와 관련된 문제를 직접 겪은 경험이 있다면 언제, 어떤 상황이었는지 말씀해 주세요.`,
      purpose: h.title,
    },
    {
      id: `${h.id}-current`,
      question: `그 문제를 해결하기 위해 현재는 어떤 방법을 쓰고 계신가요? (제품, 서비스, 대체 수단 포함)`,
      purpose: h.title,
    },
    {
      id: `${h.id}-behavior`,
      question: `그 방법에 최근 3개월 내 실제로 시간이나 돈을 쓴 적이 있다면, 얼마나 자주·얼마를 썼는지 알려주세요.`,
      purpose: h.title,
    },
  ])

  return {
    id: `q-${Date.now()}`,
    type,
    typeLabel: purposeMap[type] || type,
    itemName,
    createdAt: '2026-08-10',
    items,
  }
}
