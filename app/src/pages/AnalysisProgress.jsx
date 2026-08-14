import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import ScoreRing from '../components/ui/ScoreRing'
import ErrorState from '../components/ErrorState'
import { useApp } from '../context/AppContext'

const STEP_LABELS = [
  { key: 'MARKET', label: '시장 규모·성장률' },
  { key: 'CUSTOMER', label: '고객(타겟)' },
  { key: 'COMPETITION', label: '경쟁' },
]

export default function AnalysisProgress() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getAnalysisStatus, refreshAnalyses } = useApp()
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let stop = false
    const poll = async () => {
      try {
        const s = await getAnalysisStatus(id)
        if (stop) return
        setStatus(s)
        if (s.status === 'COMPLETED') {
          await refreshAnalyses()
          setTimeout(() => navigate(`/analyze/${id}/result`), 700)
          return
        }
      } catch (err) {
        if (!stop) setError(err)
        return
      }
      if (!stop) setTimeout(poll, 500)
    }
    poll()
    return () => {
      stop = true
    }
  }, [id, getAnalysisStatus, refreshAnalyses, navigate])

  if (error) {
    return (
      <AppShell crumb="진단 중">
        <ErrorState error={error} />
      </AppShell>
    )
  }

  const stepIndex = status?.stepIndex ?? 0
  const stepCount = status?.stepCount ?? STEP_LABELS.length + 1
  const percent = status?.status === 'COMPLETED' ? 100 : Math.min(95, Math.round((stepIndex / stepCount) * 100) + 15)

  return (
    <AppShell crumb="진단 중">
      <div className="flex flex-col items-center pt-6">
        <ScoreRing percent={percent} label={`${percent}%`} />
        <h1 className="mt-6 text-[22px] font-bold text-[#14181a]">진단 중입니다</h1>
        <p className="text-[13px] text-[#9aa39e] mt-1">{status?.progressMessage ?? '요청을 준비하고 있습니다'}</p>

        <div className="w-full max-w-[560px] mt-8 flex flex-col gap-3">
          {STEP_LABELS.map((s, idx) => {
            const done = idx < stepIndex || status?.status === 'COMPLETED'
            const active = idx === stepIndex && status?.status !== 'COMPLETED'
            return (
              <div
                key={s.key}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  active ? 'border-brand-400 bg-brand-50' : 'border-[#e2e6e3] bg-white'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] shrink-0 ${
                    done ? 'bg-brand-500 text-white' : active ? 'bg-brand-100 text-brand-700' : 'bg-[#eef1ef] text-[#9aa39e]'
                  }`}
                >
                  {done ? '✓' : idx + 1}
                </span>
                <div>
                  <p className="text-[13px] font-medium text-[#14181a]">{s.label}</p>
                  <p className="text-[12px] text-[#9aa39e]">
                    {done ? '확인 완료' : active ? '데이터 분석 중…' : '대기 중'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
