import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'

export default function QuestionnaireResult() {
  const { id, qid } = useParams()
  const navigate = useNavigate()
  const { getAnalysis, getQuestionnaire } = useApp()
  const analysis = getAnalysis(id)
  const questionnaire = getQuestionnaire(id, qid)

  if (!analysis || !questionnaire) {
    return (
      <AppLayout>
        <Card>조회할 수 있는 질문지가 없습니다.</Card>
      </AppLayout>
    )
  }

  const targetHypotheses = analysis.diagnosis.hypotheses.filter((h) =>
    questionnaire.hypothesisIds.includes(h.id),
  )

  return (
    <AppLayout>
      <h1 className="text-[20px] font-bold text-[#171719] mb-5">생성된 검증 질문지</h1>

      <Card className="mb-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[11px] text-[#999] mb-1">가설</p>
            <p className="text-[13px] text-[#333] leading-relaxed">
              {targetHypotheses.map((h) => h.title).join(' · ')}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-[#999] mb-1">질문지 유형</p>
            <p className="text-[13px] text-[#333]">{questionnaire.typeLabel}용</p>
          </div>
          <div>
            <p className="text-[11px] text-[#999] mb-1">문항 수</p>
            <p className="text-[13px] text-[#333]">{questionnaire.items.length}문항</p>
          </div>
        </div>
      </Card>

      <p className="font-semibold text-[#333] mb-3">질문 문항 목록</p>
      <div className="flex flex-col gap-3 mb-6">
        {questionnaire.items.map((item, idx) => (
          <Card key={item.id} className="flex gap-4">
            <span className="text-[13px] font-semibold text-[#999] shrink-0">Q{idx + 1}</span>
            <div>
              <p className="text-[13px] text-[#333] leading-relaxed mb-2">{item.question}</p>
              <p className="text-[11px] text-[#999]">
                검증 목적: <span className="text-[#666]">{item.purpose}</span>
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <p className="font-semibold text-[#333] mb-2">응답 기준 및 유의사항</p>
        <div className="grid sm:grid-cols-2 gap-4 text-[13px] text-[#666] leading-relaxed">
          <ul className="list-disc pl-5 space-y-1">
            <li>과거 경험과 실제 행동을 중심으로 답하도록 안내하세요.</li>
            <li>추측성 답변("아마 이용할 것 같다")은 행동 근거로 취급하지 않습니다.</li>
            <li>응답이 모호하면 구체적인 상황을 추가로 물어보세요.</li>
          </ul>
          <ul className="list-disc pl-5 space-y-1">
            <li>제품 호감도를 직접 묻는 질문은 포함되어 있지 않습니다.</li>
            <li>수요 레이어 반영은 검증 결과 입력 화면에서 저장한 뒤 갱신됩니다.</li>
            <li>이 질문지만으로 시장 진출 여부를 단정하지 마세요.</li>
          </ul>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => navigate(`/analyze/${id}/verify?qid=${qid}`)}>
          검증 결과 입력하기
        </Button>
      </div>
    </AppLayout>
  )
}
