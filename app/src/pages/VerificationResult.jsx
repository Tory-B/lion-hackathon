import { Link, useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import { useApp } from '../context/AppContext'

export default function VerificationResult() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getAnalysis } = useApp()
  const analysis = getAnalysis(id)

  const verification = analysis?.verifications[analysis.verifications.length - 1]

  if (!analysis || !verification) {
    return (
      <AppLayout>
        <Card>조회할 수 있는 검증 갱신 결과가 없습니다.</Card>
      </AppLayout>
    )
  }

  const demand = analysis.diagnosis.layers.demand
  const stillUnverified = analysis.diagnosis.hypotheses.filter((h) => h.status === 'unverified')

  return (
    <AppLayout>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
        <Link to={`/analyze/${id}/result`} className="text-[13px] text-[#666] underline">
          리스크 진단 결과로
        </Link>
        <h1 className="text-[20px] font-bold text-[#171719]">수요 진단 갱신 결과</h1>
      </div>

      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-[#333]">수요 레이어 갱신 완료</p>
          <Badge>검증 반영됨</Badge>
        </div>
        <div className="grid sm:grid-cols-4 gap-4">
          <div>
            <p className="text-[11px] text-[#999] mb-1">갱신 전 검증 수준</p>
            <p className="text-[13px] text-[#333]">미검증 · 데이터 없음</p>
          </div>
          <div>
            <p className="text-[11px] text-[#999] mb-1">갱신 후 검증 수준</p>
            <p className="text-[13px] text-[#333]">{demand.verificationLabel}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#999] mb-1">수요 점수 변화</p>
            <p className="text-[13px] text-[#333] font-medium">
              {verification.beforeScore}점 → {verification.afterScore}점
            </p>
          </div>
          <div>
            <p className="text-[11px] text-[#999] mb-1">기준 시점</p>
            <p className="text-[13px] text-[#333]">{verification.savedAt} 기준</p>
          </div>
        </div>
        <p className="text-[11px] text-[#999] mt-3">
          이 점수는 시장 진출 여부의 판정이 아니라, 현재까지 확보된 검증 근거를 보여주는 진단
          지표입니다.
        </p>
      </Card>

      <p className="font-semibold text-[#333] mb-3">입력한 검증 결과 요약</p>
      <div className="flex flex-col gap-3 mb-6">
        {verification.responses.map((r, idx) => (
          <Card key={r.questionId}>
            <p className="text-[13px] font-medium text-[#333] mb-2">
              질문 {idx + 1}. {r.question}
            </p>
            <p className="text-[12px] text-[#666] mb-1">응답 수: {r.count}건</p>
            <ProgressBar percent={Math.min(100, r.count * 15)} className="mb-2" />
            <p className="text-[12px] text-[#666] leading-relaxed">
              핵심 관찰: {r.observation || r.summary}
            </p>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <p className="font-semibold text-[#333] mb-2">변화 근거 및 데이터 신뢰 한계</p>
        <div className="grid sm:grid-cols-2 gap-4 text-[13px] text-[#666] leading-relaxed">
          <div>
            <p className="text-[12px] font-medium text-[#333] mb-1">점수 상승 주요 근거</p>
            <ul className="space-y-1">
              <li>▸ 총 {verification.totalResponses}건의 응답이 반영되었습니다.</li>
              <li>▸ 응답자가 직접 경험한 문제 상황과 현재 대처 방식이 확인되었습니다.</li>
              <li>▸ 일부 가설은 부분 검증 또는 검증됨 상태로 갱신되었습니다.</li>
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#333] mb-1">데이터 신뢰 한계</p>
            <ul className="space-y-1">
              <li>! 응답 수가 통계적으로 유의미한 수준은 아닐 수 있습니다.</li>
              <li>! 응답자 모집 경로에 따라 편향이 있을 수 있습니다.</li>
              <li>! 실제 지불 의향·구매 행동까지 확인된 것은 아닙니다.</li>
            </ul>
          </div>
        </div>
      </Card>

      <p className="font-semibold text-[#333] mb-3">아직 미검증 상태인 핵심 가설</p>
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {stillUnverified.length === 0 ? (
          <Card>
            <p className="text-[13px] text-[#666]">모든 가설이 부분 검증 이상 상태입니다.</p>
          </Card>
        ) : (
          stillUnverified.map((h) => (
            <Card key={h.id}>
              <Badge className="mb-2">미검증</Badge>
              <p className="text-[13px] text-[#333] leading-relaxed">{h.title}</p>
            </Card>
          ))
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => navigate(`/analyze/${id}/result`)}>리스크 진단 결과 보기</Button>
      </div>
    </AppLayout>
  )
}
