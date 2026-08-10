import { Link, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { useApp } from '../context/AppContext'

const LAYER_ORDER = ['market', 'competition', 'timing', 'demand']

export default function EvidenceDetail() {
  const { id } = useParams()
  const { getAnalysis } = useApp()
  const analysis = getAnalysis(id)

  if (!analysis || !analysis.diagnosis) {
    return (
      <AppLayout>
        <Card>조회할 수 있는 진단 근거가 없습니다.</Card>
      </AppLayout>
    )
  }

  const { diagnosis } = analysis

  return (
    <AppLayout>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <h1 className="text-[20px] font-bold text-[#171719]">진단 근거 상세</h1>
        <Link to={`/analyze/${id}/result`} className="text-[13px] text-[#666] underline">
          리스크 진단 결과로
        </Link>
      </div>
      <p className="text-[13px] text-[#666] mb-4">
        각 리스크 요인의 판단에 사용된 데이터 근거와 신뢰 한계를 확인합니다.
      </p>
      <div className="flex gap-2 mb-6">
        {LAYER_ORDER.map((key) => (
          <Badge key={key}>{diagnosis.layers[key].label}</Badge>
        ))}
      </div>

      {LAYER_ORDER.map((key) => {
        const layer = diagnosis.layers[key]
        const evidence = diagnosis.evidence.filter((e) => e.layer === key)
        return (
          <div key={key} className="mb-6">
            <p className="font-semibold text-[#333] mb-3">{layer.label} 레이어 — 핵심 요인 근거</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {evidence.map((e, idx) => (
                <Card key={e.id}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-[13px] font-medium text-[#333] leading-snug">
                      {e.factorTitle}
                    </p>
                    <Badge className="shrink-0">{idx === 0 ? '영향 높음' : '영향 중간'}</Badge>
                  </div>
                  <div className="text-[12px] text-[#777] leading-relaxed space-y-1">
                    <p>출처: {e.source}</p>
                    <p>기준 시점: {e.asOf}</p>
                    <p>
                      신뢰 한계:{' '}
                      {e.reliability === 'low'
                        ? '데이터 표본이 제한적이라 해석에 주의가 필요합니다.'
                        : '공개 데이터 기준으로 비교적 신뢰할 수 있습니다.'}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      <p className="font-semibold text-[#333] mb-3">미검증 가설 — 직접 검증 필요 항목</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {diagnosis.hypotheses
          .filter((h) => h.status === 'unverified')
          .map((h) => (
            <Card key={h.id}>
              <div className="flex items-center gap-2 mb-2">
                <Badge>미검증</Badge>
              </div>
              <p className="text-[13px] font-medium text-[#333] mb-1.5">{h.title}</p>
              <p className="text-[12px] text-[#666] leading-relaxed">
                검증 방법 제안: 고객 인터뷰 또는 설문으로 과거 경험과 실제 행동을 확인하세요.
              </p>
            </Card>
          ))}
      </div>
    </AppLayout>
  )
}
