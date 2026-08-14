import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import RiskBadge from '../components/ui/RiskBadge'
import { useApp } from '../context/AppContext'
import { getAnalysisMeta } from '../lib/localMeta'
import { gradeScore } from '../lib/riskGrader'

const MAX_COMPARE = 3
const LAYER_ORDER = ['market', 'customer', 'competition']

export default function CompareItems() {
  const { analyses, refreshAnalyses, getDiagnosis } = useApp()
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)
  const [selected, setSelected] = useState([])
  const [diagnoses, setDiagnoses] = useState({})

  useEffect(() => {
    refreshAnalyses().then(() => setLoaded(true))
  }, [refreshAnalyses])

  const comparable = useMemo(
    () => analyses.filter((a) => a.status === 'COMPLETED' && getAnalysisMeta(a.analysisId)?.paid),
    [analyses],
  )

  const toggle = (analysisId) => {
    setSelected((prev) => {
      if (prev.includes(analysisId)) return prev.filter((x) => x !== analysisId)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, analysisId]
    })
  }

  useEffect(() => {
    selected.forEach((analysisId) => {
      if (!diagnoses[analysisId]) {
        getDiagnosis(analysisId).then((d) => setDiagnoses((prev) => ({ ...prev, [analysisId]: d })))
      }
    })
  }, [selected, diagnoses, getDiagnosis])

  const selectedDiagnoses = selected.map((id) => diagnoses[id]).filter(Boolean)

  return (
    <AppShell crumb="아이템 비교">
      <h1 className="text-[22px] font-bold text-[#14181a] mb-1">아이템 비교</h1>
      <p className="text-[13px] text-[#6b7570] mb-6">
        결제해서 전체가 열린 아이템 중 최대 {MAX_COMPARE}개를 골라 레이어별 점수를 나란히 비교합니다.
      </p>

      {!loaded ? (
        <p className="text-[13px] text-[#9aa39e]">불러오는 중…</p>
      ) : comparable.length < 2 ? (
        <Card className="text-center py-14">
          <p className="font-semibold text-[#14181a] mb-2">비교할 아이템이 부족합니다</p>
          <p className="text-[13px] text-[#6b7570] mb-5">
            전체가 열린(결제된) 아이템이 2개 이상이어야 비교할 수 있습니다.
          </p>
          <Button onClick={() => navigate('/')}>+ 새 아이템 진단</Button>
        </Card>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {comparable.map((a) => {
              const meta = getAnalysisMeta(a.analysisId)
              const checked = selected.includes(a.analysisId)
              return (
                <label
                  key={a.analysisId}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer ${
                    checked ? 'border-brand-500 bg-brand-50' : 'border-[#e2e6e3] bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 accent-emerald-600"
                    checked={checked}
                    disabled={!checked && selected.length >= MAX_COMPARE}
                    onChange={() => toggle(a.analysisId)}
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-[#14181a]">{a.itemName}</p>
                    {meta && (
                      <p className="text-[11px] text-[#9aa39e]">
                        {meta.districtName} · {meta.industryName}
                      </p>
                    )}
                    <p className="text-[13px] font-bold text-[#14181a] mt-1">{a.totalScore}점</p>
                  </div>
                </label>
              )
            })}
          </div>

          {selected.length < 2 ? (
            <Card>
              <p className="text-[13px] text-[#6b7570]">2개 이상 선택하면 비교표가 나타납니다.</p>
            </Card>
          ) : selectedDiagnoses.length < selected.length ? (
            <p className="text-[13px] text-[#9aa39e]">불러오는 중…</p>
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full text-[13px] min-w-[480px]">
                <thead>
                  <tr className="text-left text-[#9aa39e] text-[11px]">
                    <th className="font-normal pb-3 pr-4">항목</th>
                    {selectedDiagnoses.map((d) => (
                      <th key={d.analysisId} className="font-medium text-[#14181a] pb-3 pr-4">
                        {d.itemName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[#eef1ef]">
                    <td className="py-2.5 pr-4 text-[#6b7570]">종합 점수</td>
                    {selectedDiagnoses.map((d) => (
                      <td key={d.analysisId} className="py-2.5 pr-4">
                        <span className="font-bold text-[#14181a]">{d.totalScore}</span>
                        <span className="text-[#9aa39e]"> / 100</span>{' '}
                        <RiskBadge level={gradeScore('TOTAL', d.totalScore)} />
                      </td>
                    ))}
                  </tr>
                  {LAYER_ORDER.map((key) => (
                    <tr key={key} className="border-t border-[#eef1ef]">
                      <td className="py-2.5 pr-4 text-[#6b7570]">{diagnoses[selected[0]]?.layers[key]?.layerName}</td>
                      {selectedDiagnoses.map((d) => {
                        const layer = d.layers[key]
                        return (
                          <td key={d.analysisId} className="py-2.5 pr-4">
                            <span className="font-semibold text-[#14181a]">{layer.score}</span>
                            <span className="text-[#9aa39e]"> / {layer.maxScore}</span>{' '}
                            <RiskBadge level={layer.riskLevel} />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                  <tr className="border-t border-[#eef1ef]">
                    <td className="py-2.5 pr-4 text-[#6b7570]">판정</td>
                    {selectedDiagnoses.map((d) => (
                      <td key={d.analysisId} className="py-2.5 pr-4 text-[12px] text-[#4b5450]">
                        <Badge className="mb-1">판정</Badge> {d.verdict}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </AppShell>
  )
}
