// POST /api/analyses/{id}/questionnaires 목업 — 과거 경험·현재 해결 방식·발생 빈도·실제 지출만 묻는다.
let itemIdCounter = 100

function questionsFor(hypothesis, itemName) {
  itemIdCounter += 1
  const base = itemIdCounter * 10
  return [
    {
      itemId: base + 1,
      order: 1,
      questionText: `최근 3개월 안에 "${hypothesis.description.replace(/[?.]/g, '')}"와 관련된 상황을 겪은 적이 있다면, 그때 어떻게 하셨나요?`,
      purpose: '현재 해결 방식 확인',
    },
    {
      itemId: base + 2,
      order: 2,
      questionText: `그때 가장 번거롭거나 아쉬웠던 순간은 언제였나요?`,
      purpose: '불편의 실체 확인',
    },
    {
      itemId: base + 3,
      order: 3,
      questionText: `"${itemName}"과 비슷한 것에 최근 실제로 지출한 경험이 있다면 얼마였는지 알려주세요.`,
      purpose: '실제 지불 행동 확인',
    },
  ]
}

export function buildQuestionnaire({ hypotheses, itemName, type }) {
  const items = hypotheses.flatMap((h) => questionsFor(h, itemName))
  items.forEach((it, idx) => {
    it.order = idx + 1
  })

  return {
    questionnaireId: Date.now(),
    type,
    items,
    leadingQuestionCheck: {
      passed: true,
      summary: `"이런 게 있으면 이용하시겠어요?" 같은 미래 의향을 묻지 않고, 최근 실제 경험·행동·지출을 묻도록 구성했습니다.`,
    },
    createdAt: new Date().toISOString(),
  }
}
