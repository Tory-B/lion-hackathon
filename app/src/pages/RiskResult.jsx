import { Link, useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'

export default function RiskResult() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getAnalysis } = useApp()
  const analysis = getAnalysis(id)

  if (!analysis || !analysis.diagnosis) {
    return (
      <AppLayout>
        <Card>조회할 수 있는 진단 결과가 없습니다.</Card>
      </AppLayout>
    )
  }

  const { diagnosis } = analysis
  const unverifiedCount = diagnosis.hypotheses.filter((h) => h.status === 'unverified').length
  const verifiedCount = diagnosis.hypotheses.length - unverifiedCount

  return (
    <AppLayout>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
        <h1 className="text-[20px] font-bold text-[#171719]">리스크 진단 결과</h1>
        <Link to={`/analyze/${id}/evidence`} className="text-[13px] text-[#666] underline">
          진단 근거 상세 보기
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Card>
          <p className="font-semibold text-[#333] mb-2">종합 리스크 점수</p>
          <p className="text-[28px] font-bold text-[#171719]">
            {diagnosis.compositeScore}점 <span className="text-[16px] text-[#999]">/ 100</span>
          </p>
          <p className="text-[12px] text-[#666] mt-2 leading-relaxed">
            현재 확보된 근거 기준 진단 점수입니다. 미검증 가설이 해소되면 점수가 변동될 수
            있습니다.
          </p>
          <p className="text-[12px] text-[#999] mt-3">분석 대상: {analysis.itemName}</p>
          <p className="text-[12px] text-[#999]">분석 완료일: {analysis.createdAt}</p>
        </Card>
        <Card>
          <p className="font-semibold text-[#333] mb-2">수요 검증 현황</p>
          <p className="text-[13px] text-[#333] mb-2">
            미검증 가설 {unverifiedCount}개 · 검증된 가설 {verifiedCount}개
          </p>
          <p className="text-[12px] text-[#666] mb-4 leading-relaxed">
            데이터로 확인할 수 없는 항목은 고객 인터뷰·설문으로 직접 확인해야 합니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate(`/analyze/${id}/hypotheses`)}>
              질문지 생성하기
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/analyze/${id}/verify`)}>
              검증 결과 입력
            </Button>
          </div>
        </Card>
      </div>

      <p className="font-semibold text-[#333] mb-3">레이어별 진단 결과</p>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {Object.values(diagnosis.layers).map((layer) => (
          <Card key={layer.key}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-[#333]">{layer.label} 레이어</p>
              <Badge>{layer.key === 'demand' ? layer.verificationLabel : layer.level.label}</Badge>
            </div>
            <p className="text-[13px] text-[#333] mb-2">점수: {layer.score}점</p>
            <div className="flex flex-col gap-1.5">
              {layer.factors.map((f) => (
                <p key={f.id} className="text-[12px] text-[#666] leading-relaxed">
                  · {f.title}
                </p>
              ))}
            </div>
            {layer.key === 'demand' && (
              <p className="text-[11px] text-[#999] mt-2">
                검증 수준: {verifiedCount} / {diagnosis.hypotheses.length}개 가설 검증됨
              </p>
            )}
          </Card>
        ))}
      </div>

      <p className="font-semibold text-[#333] mb-3">미검증 가설 목록</p>
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {diagnosis.hypotheses.map((h) => (
          <Card key={h.id}>
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <p className="text-[13px] font-medium text-[#333]">{h.title}</p>
              <Badge className="shrink-0">
                {h.status === 'unverified' ? '미검증' : h.status === 'partial' ? '부분 검증' : '검증됨'}
              </Badge>
            </div>
            <p className="text-[12px] text-[#666] leading-relaxed">{h.description}</p>
          </Card>
        ))}
      </div>

      <p className="font-semibold text-[#333] mb-3">다음 검증 행동</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <p className="font-semibold text-[#333] mb-2">질문지 생성</p>
          <p className="text-[12px] text-[#666] mb-4">
            미검증 가설을 선택해 인터뷰용 또는 설문용 질문지를 생성합니다.
          </p>
          <Button onClick={() => navigate(`/analyze/${id}/hypotheses`)}>
            미검증 가설 선택 후 질문지 생성
          </Button>
        </Card>
        <Card>
          <p className="font-semibold text-[#333] mb-2">검증 결과 입력</p>
          <p className="text-[12px] text-[#666] mb-4">
            외부 채널에서 수집한 인터뷰·설문 결과를 입력해 진단을 갱신합니다.
          </p>
          <Button onClick={() => navigate(`/analyze/${id}/verify`)}>검증 결과 입력하기</Button>
        </Card>
      </div>
    </AppLayout>
  )
}
