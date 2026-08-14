import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'

const TYPE_LABEL = { INTERVIEW: '인터뷰용', SURVEY: '설문용' }

export default function QuestionnaireList() {
  const { listAllQuestionnaires } = useApp()
  const navigate = useNavigate()
  const [items, setItems] = useState(null)

  useEffect(() => {
    listAllQuestionnaires().then(setItems)
  }, [listAllQuestionnaires])

  return (
    <AppShell crumb="설문지">
      <h1 className="text-[22px] font-bold text-[#14181a] mb-1">설문지</h1>
      <p className="text-[13px] text-[#6b7570] mb-6">아이템별로 생성한 검증 질문지를 모아봅니다.</p>

      {items === null ? (
        <p className="text-[13px] text-[#9aa39e]">불러오는 중…</p>
      ) : items.length === 0 ? (
        <Card className="text-center py-14">
          <p className="font-semibold text-[#14181a] mb-2">아직 생성한 질문지가 없습니다</p>
          <p className="text-[13px] text-[#6b7570] mb-5">
            아이템을 결제하고 진단 결과에서 미검증 항목을 선택하면 질문지를 만들 수 있습니다.
          </p>
          <Button onClick={() => navigate('/home')}>내 아이템으로 이동</Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((q) => (
            <Card key={q.questionnaireId} className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-[#14181a]">{q.itemName}</p>
                  <Badge>{TYPE_LABEL[q.type] ?? q.type}</Badge>
                </div>
                <p className="text-[12px] text-[#9aa39e]">
                  {q.itemCount}문항 · {new Date(q.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <Link
                to={`/analyze/${q.analysisId}/questionnaire/${q.questionnaireId}`}
                className="text-[13px] text-brand-700 font-medium underline"
              >
                질문지 보기 →
              </Link>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  )
}
