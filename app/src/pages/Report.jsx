import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import RiskBadge from '../components/ui/RiskBadge'
import ProgressBar from '../components/ui/ProgressBar'
import ErrorState from '../components/ErrorState'
import { useApp } from '../context/AppContext'
import { getAnalysisMeta } from '../lib/localMeta'
import { gradeScore } from '../lib/riskGrader'
import { computeEarned, FACTOR_EXPLAIN } from '../lib/factorWeights'

const LAYER_ORDER = ['market', 'customer', 'competition']

export default function Report() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getDiagnosis, getEvidence } = useApp()
  const [diagnosis, setDiagnosis] = useState(null)
  const [evidence, setEvidence] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getDiagnosis(id), getEvidence(id)])
      .then(([d, e]) => {
        setDiagnosis(d)
        setEvidence(e)
      })
      .catch(setError)
  }, [id, getDiagnosis, getEvidence])

  if (error) {
    return (
      <AppShell crumb="리포트">
        <ErrorState error={error} />
      </AppShell>
    )
  }

  if (!diagnosis || !evidence) {
    return (
      <AppShell crumb="리포트">
        <p className="text-[13px] text-[#9aa39e]">불러오는 중…</p>
      </AppShell>
    )
  }

  if (diagnosis.accessLevel === 'FREE') {
    return (
      <AppShell crumb="리포트">
        <Card className="text-center py-14">
          <p className="font-semibold text-[#14181a] mb-2">결제 후 열람할 수 있는 리포트입니다</p>
          <p className="text-[13px] text-[#6b7570] mb-5">레이어 상세와 근거는 결제하면 바로 열립니다.</p>
          <Button onClick={() => navigate(`/analyze/${id}/payment`)}>9,900원으로 전체 열기</Button>
        </Card>
      </AppShell>
    )
  }

  const layers = LAYER_ORDER.map((k) => diagnosis.layers[k])
  const today = new Date().toLocaleDateString('ko-KR')
  const meta = getAnalysisMeta(id)
  const totalRisk = gradeScore('TOTAL', diagnosis.totalScore)

  return (
    <AppShell crumb="리포트">
      <div className="flex items-center justify-end gap-2 mb-4 print:hidden">
        <Button variant="secondary" onClick={() => window.print()}>
          인쇄
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
        >
          링크 공유
        </Button>
      </div>

      <Card className="!bg-ink-900 text-white mb-5">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[18px] font-bold">suyo</span>
          <span className="text-[12px] text-white/60">{today}</span>
        </div>
        <p className="text-[11px] tracking-wide text-brand-300 mb-1">STARTUP RISK REPORT</p>
        <h1 className="text-[26px] font-bold mb-6 leading-snug">
          {meta ? `${meta.districtName} ${meta.industryName}` : diagnosis.itemName} 창업 리스크 진단 리포트
        </h1>
        <div className="flex flex-wrap gap-10">
          <div>
            <p className="text-[11px] text-white/50 mb-1">종합 점수</p>
            <p className="text-[28px] font-bold">
              {diagnosis.totalScore} <span className="text-[14px] text-white/50 font-normal">/ 100</span>
            </p>
          </div>
          <div>
            <p className="text-[11px] text-white/50 mb-1">등급</p>
            <RiskBadge level={totalRisk} />
          </div>
        </div>
      </Card>

      <Card className="mb-5">
        <p className="font-semibold text-[#14181a] mb-4">레이어별 점수</p>
        <div className="flex flex-col gap-3">
          {layers.map((l) => (
            <div key={l.layer} className="flex items-center gap-4">
              <span className="w-24 text-[13px] text-[#4b5450] shrink-0">{l.layerName}</span>
              <ProgressBar percent={(l.score / l.maxScore) * 100} className="flex-1" />
              <span className="w-16 text-right text-[13px] font-semibold text-[#14181a]">
                {l.score}/{l.maxScore}
              </span>
              <RiskBadge level={l.riskLevel} />
            </div>
          ))}
        </div>
      </Card>

      {layers.map((l, idx) => (
        <Card key={l.layer} className="mb-5">
          <p className="font-semibold text-[#14181a] mb-3">
            {idx + 1}. {l.layerName}
          </p>
          <div className="flex flex-col gap-3">
            {l.factors.map((f) => {
              const computed = computeEarned(f)
              return (
                <div key={f.factor} className="border-t border-[#eef1ef] pt-3 first:border-t-0 first:pt-0">
                  <p className="text-[13px] font-medium text-[#14181a] flex items-center gap-1.5">
                    <span className="text-brand-600">✓</span>
                    {f.factor} — {f.percentile}
                    {computed?.earned != null ? ` (${computed.earned}/${computed.weight}점)` : ''}
                  </p>
                  {FACTOR_EXPLAIN[f.factor] && (
                    <p className="text-[12px] text-[#9aa39e] mt-1 pl-5">{FACTOR_EXPLAIN[f.factor]}</p>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      ))}

      <Card className="mb-5 !bg-brand-50 border-brand-200">
        <p className="font-semibold text-brand-900 mb-2">결론</p>
        <p className="text-[13px] text-brand-900 leading-relaxed">{diagnosis.aiSummary || diagnosis.verdict}</p>
      </Card>

      <Card className="mb-5">
        <p className="font-semibold text-[#14181a] mb-3">직접 검증이 필요한 항목</p>
        <ul className="flex flex-col gap-1.5">
          {evidence.unverifiedHypotheses.map((h) => (
            <li key={h.hypothesisId} className="text-[13px] text-[#4b5450] flex items-start gap-1.5">
              <span className="text-[#9aa39e] mt-0.5">×</span>
              <span>{h.description}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <p className="font-semibold text-[#14181a] mb-3">부록 · 데이터 출처</p>
        <table className="w-full text-[12px] text-[#4b5450]">
          <thead>
            <tr className="text-left text-[#9aa39e]">
              <th className="font-normal pb-2">근거</th>
              <th className="font-normal pb-2">값</th>
              <th className="font-normal pb-2">출처</th>
              <th className="font-normal pb-2">기준 시점</th>
            </tr>
          </thead>
          <tbody>
            {evidence.confirmedEvidences.map((e, i) => (
              <tr key={i} className="border-t border-[#eef1ef]">
                <td className="py-2 pr-3">{e.factor}</td>
                <td className="py-2 pr-3 font-medium text-[#14181a]">{e.value}</td>
                <td className="py-2 pr-3">{e.source}</td>
                <td className="py-2">{e.referenceDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[11px] text-[#9aa39e] mt-4">
          등급은 서울 2,395개 업종×지역 조합 대비 상대적 위치입니다. 절대적으로 안전한 사업이라는 뜻이 아닙니다.
        </p>
      </Card>
    </AppShell>
  )
}
