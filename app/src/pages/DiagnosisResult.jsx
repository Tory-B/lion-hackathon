import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import RiskBadge from '../components/ui/RiskBadge'
import ConfidenceTag from '../components/ui/ConfidenceTag'
import ErrorState from '../components/ErrorState'
import { useApp } from '../context/AppContext'
import { getAnalysisMeta } from '../lib/localMeta'
import { gradeScore } from '../lib/riskGrader'
import { computeEarned } from '../lib/factorWeights'

const LAYER_ORDER = ['market', 'customer', 'competition']

function LayerCard({ layer, locked, expanded, onToggle }) {
  return (
    <Card className={locked ? 'relative overflow-hidden' : ''}>
      <button
        type="button"
        onClick={() => !locked && onToggle(layer.layer)}
        className="w-full text-left"
        disabled={locked}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-ink-900 text-white text-[10px] font-bold">
              {layer.layer === 'MARKET' ? 'L1' : layer.layer === 'CUSTOMER' ? 'L2' : 'L3'}
            </span>
            <span className="font-semibold text-[#14181a]">{layer.layerName}</span>
          </span>
          <RiskBadge level={layer.riskLevel} />
        </div>
        <p className={`text-[26px] font-bold text-[#14181a] ${locked ? 'blur-sm select-none' : ''}`}>
          {layer.score} <span className="text-[14px] text-[#9aa39e] font-normal">/ {layer.maxScore}</span>
        </p>
        {!locked && <p className="text-[12px] text-brand-700 mt-1">{expanded ? '접기 ▲' : '산출 근거 ▼'}</p>}
      </button>
    </Card>
  )
}

function LayerBreakdown({ layer }) {
  return (
    <Card className="border-brand-300">
      <div className="flex items-center justify-between mb-1">
        <p className="font-semibold text-[#14181a]">
          {layer.layerName} — 왜 {layer.maxScore}점 중 {layer.score}점인가
        </p>
        <RiskBadge level={layer.riskLevel} />
      </div>
      <p className="text-[12px] text-[#6b7570] mb-3">{layer.summary}</p>

      {/* 좁은 화면: 카드형. 5개 컬럼 표는 모바일에서 가로 스크롤 안쪽에 값이 가려지기 쉬워 따로 둔다. */}
      <div className="flex flex-col gap-2 sm:hidden">
        {layer.factors.map((f) => {
          const computed = computeEarned(f)
          return (
            <div key={f.factor} className="border border-[#eef1ef] rounded-lg px-3 py-2.5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-[13px] font-medium text-[#14181a]">{f.factor}</p>
                <p className="text-[13px] font-semibold text-[#14181a] shrink-0">
                  {computed?.earned != null ? (
                    <>
                      {computed.earned}
                      <span className="text-[#9aa39e] font-normal">/{computed.weight}</span>
                    </>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              <p className="text-[12px] text-[#6b7570] mb-1">{f.value}</p>
              {f.confidenceStatus === 'LOW_SAMPLE' ? (
                <ConfidenceTag status="LOW_SAMPLE" />
              ) : (
                <p className="text-[11px] text-[#9aa39e]">{f.percentile}</p>
              )}
            </div>
          )
        })}
        <div className="flex items-center justify-between px-1 pt-1 text-[13px] font-semibold text-[#14181a]">
          <span>합계</span>
          <span>
            {layer.score} <span className="text-[#9aa39e] font-normal">/ {layer.maxScore}</span>
          </span>
        </div>
      </div>

      {/* 넓은 화면: 표 */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[#9aa39e] text-[11px]">
              <th className="font-normal pb-2">세부 지표</th>
              <th className="font-normal pb-2">값</th>
              <th className="font-normal pb-2">배점</th>
              <th className="font-normal pb-2">백분위</th>
              <th className="font-normal pb-2">획득</th>
            </tr>
          </thead>
          <tbody>
            {layer.factors.map((f) => {
              const computed = computeEarned(f)
              return (
                <tr key={f.factor} className="border-t border-[#eef1ef]">
                  <td className="py-2 pr-3 font-medium text-[#14181a] whitespace-nowrap">{f.factor}</td>
                  <td className="py-2 pr-3 text-[#6b7570]">{f.value}</td>
                  <td className="py-2 pr-3 text-[#6b7570]">{computed?.weight ?? '—'}</td>
                  <td className="py-2 pr-3">
                    {f.confidenceStatus === 'LOW_SAMPLE' ? (
                      <ConfidenceTag status="LOW_SAMPLE" />
                    ) : (
                      <span className="text-[#6b7570]">{f.percentile}</span>
                    )}
                  </td>
                  <td className="py-2 font-semibold text-[#14181a]">
                    {computed?.earned != null ? (
                      <>
                        {computed.earned} <span className="text-[#9aa39e] font-normal">/ {computed.weight}</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              )
            })}
            <tr className="border-t border-[#e2e6e3] font-semibold text-[#14181a]">
              <td className="py-2">합계</td>
              <td />
              <td className="py-2">{layer.maxScore}</td>
              <td />
              <td className="py-2">{layer.score}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-[#9aa39e] mt-3">
        출처: {layer.factors[0]?.source} · 기준 시점: {layer.factors[0]?.referenceDate}
      </p>
    </Card>
  )
}

export default function DiagnosisResult() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getDiagnosis, getEvidence } = useApp()
  const [diagnosis, setDiagnosis] = useState(null)
  const [evidence, setEvidence] = useState(null)
  const [expandedLayer, setExpandedLayer] = useState(null)
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
      <AppShell crumb="진단 결과">
        <ErrorState error={error} />
      </AppShell>
    )
  }

  if (!diagnosis || !evidence) {
    return (
      <AppShell crumb="진단 결과">
        <p className="text-[13px] text-[#9aa39e]">불러오는 중…</p>
      </AppShell>
    )
  }

  const meta = getAnalysisMeta(id)
  const locked = diagnosis.accessLevel === 'FREE'
  const layers = LAYER_ORDER.map((k) => diagnosis.layers[k])
  const totalRisk = gradeScore('TOTAL', diagnosis.totalScore)
  const title = meta ? `${meta.districtName} · ${meta.industryName}` : diagnosis.itemName

  return (
    <AppShell crumb={title}>
      <Card className="!bg-ink-900 text-white mb-4">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[13px] text-white/60 mb-1">
              <span>{meta ? `서울 ${meta.districtName} · ${meta.industryName}` : diagnosis.itemName}</span>
              {!locked && (
                <span className="inline-flex items-center h-5 px-2 rounded bg-white/10 text-[11px]">전체 열람</span>
              )}
            </div>
            <p className="text-[42px] font-bold leading-none">
              {diagnosis.totalScore}
              <span className="text-[18px] text-white/50 font-normal"> / 100</span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <RiskBadge level={totalRisk} />
              <span className="text-[12px] text-white/60">서울 2,395개 조합 중 상대 위치</span>
            </div>
          </div>
          <div className="max-w-[380px]">
            <p className="font-semibold mb-1">{diagnosis.verdict}</p>
            <p className="text-[12px] text-white/70 leading-relaxed">
              등급은 서울 2,395개 업종×지역 조합의 점수 분포를 3등분한 상대 위치입니다. &quot;안전&quot;이 절대적으로
              안전하다는 뜻은 아닙니다.
            </p>
          </div>
        </div>
      </Card>

      {locked ? (
        <Card className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-[#14181a] mb-1">3개 레이어 전체와 유사기업 근거</p>
            <p className="text-[13px] text-[#6b7570]">점수는 나왔는데 이유를 모르는 상태입니다.</p>
          </div>
          <Button onClick={() => navigate(`/analyze/${id}/payment`)}>9,900원으로 전체 열기</Button>
        </Card>
      ) : (
        <Card className="mb-6">
          <p className="text-[13px] text-[#4b5450] mb-2">모든 지표는 서울 전체 분포의 백분위로 환산해 배점에 곱합니다.</p>
          <div className="flex flex-wrap gap-4 text-[12px] text-[#6b7570]">
            <span className="inline-flex items-center gap-1">
              <ConfidenceTag status="CONFIRMED" /> 실측 — 상권·통계 데이터에서 그대로 읽은 값
            </span>
            <span className="inline-flex items-center gap-1">
              <ConfidenceTag status="LOW_SAMPLE" /> 표본 적음 — 참고용으로만 해석
            </span>
            <span className="inline-flex items-center gap-1">
              <ConfidenceTag status="INSUFFICIENT_DATA" /> 빈칸 — 설문으로 메워야 하는 것
            </span>
          </div>
        </Card>
      )}

      <p className="font-semibold text-[#14181a] mb-3">레이어별 진단 결과</p>
      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        {layers.map((layer) => (
          <LayerCard
            key={layer.layer}
            layer={layer}
            locked={locked}
            expanded={expandedLayer === layer.layer}
            onToggle={(k) => setExpandedLayer(expandedLayer === k ? null : k)}
          />
        ))}
      </div>

      {!locked && expandedLayer && (
        <div className="mb-6">
          <LayerBreakdown layer={layers.find((l) => l.layer === expandedLayer)} />
        </div>
      )}

      {!locked && (
        <>
          <p className="font-semibold text-[#14181a] mb-3">직접 검증이 필요한 항목</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {evidence.unverifiedHypotheses.map((h) => (
              <Card key={h.hypothesisId}>
                <ConfidenceTag status="INSUFFICIENT_DATA" className="mb-2" />
                <p className="text-[13px] text-[#14181a] leading-relaxed">{h.description}</p>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <Button variant="secondary" onClick={() => navigate(`/analyze/${id}/report`)}>
              리포트 보기
            </Button>
            <Button onClick={() => navigate(`/analyze/${id}/questionnaire`)}>설문지 만들기 →</Button>
          </div>
        </>
      )}
    </AppShell>
  )
}
