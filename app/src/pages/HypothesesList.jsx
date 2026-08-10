import { Link, useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'

const STATUS_LABEL = {
  unverified: '미검증',
  partial: '부분 검증',
  verified: '검증됨',
}

export default function HypothesesList() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getAnalysis } = useApp()
  const analysis = getAnalysis(id)

  if (!analysis || !analysis.diagnosis) {
    return (
      <AppLayout>
        <Card>조회할 수 있는 가설 목록이 없습니다.</Card>
      </AppLayout>
    )
  }

  const { hypotheses } = analysis.diagnosis

  return (
    <AppLayout>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <h1 className="text-[20px] font-bold text-[#171719]">미검증 가설 목록</h1>
        <Link to={`/analyze/${id}/result`} className="text-[13px] text-[#666] underline">
          리스크 진단 결과로
        </Link>
      </div>
      <p className="text-[13px] text-[#666] mb-6">
        아래 가설은 현재 확보된 데이터만으로 확인할 수 없습니다. 검증 우선순위를 참고해 고객
        조사 계획을 세우세요.
      </p>

      <p className="font-semibold text-[#333] mb-3">가설 목록</p>
      <div className="flex flex-col gap-3">
        {hypotheses.map((h) => (
          <Card key={h.id} className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge>{STATUS_LABEL[h.status]}</Badge>
              </div>
              <p className="text-[13px] font-medium text-[#333] mb-1">{h.title}</p>
              <p className="text-[12px] text-[#666] leading-relaxed">근거 요약: {h.description}</p>
              <p className="text-[11px] text-[#999] mt-1">
                신뢰 한계: 현재 공개 데이터만으로는 이 가설을 확인할 수 없습니다.
              </p>
            </div>
            {h.status === 'verified' ? (
              <Badge className="shrink-0">검증 완료</Badge>
            ) : (
              <Button
                variant="secondary"
                className="shrink-0"
                onClick={() => navigate(`/analyze/${id}/questionnaire/new?hyp=${h.id}`)}
              >
                질문지 생성
              </Button>
            )}
          </Card>
        ))}
      </div>
    </AppLayout>
  )
}
