import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import RiskBadge from '../components/ui/RiskBadge'
import { useApp } from '../context/AppContext'
import { getAnalysisMeta } from '../lib/localMeta'
import { gradeScore } from '../lib/riskGrader'

export default function ReportList() {
  const { analyses, refreshAnalyses } = useApp()
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    refreshAnalyses().then(() => setLoaded(true))
  }, [refreshAnalyses])

  const reportable = analyses.filter((a) => a.status === 'COMPLETED' && getAnalysisMeta(a.analysisId)?.paid)

  return (
    <AppShell crumb="리포트">
      <h1 className="text-[22px] font-bold text-[#14181a] mb-1">리포트</h1>
      <p className="text-[13px] text-[#6b7570] mb-6">결제해서 전체가 열린 아이템의 리포트를 모아봅니다.</p>

      {!loaded ? (
        <p className="text-[13px] text-[#9aa39e]">불러오는 중…</p>
      ) : reportable.length === 0 ? (
        <Card className="text-center py-14">
          <p className="font-semibold text-[#14181a] mb-2">열람 가능한 리포트가 없습니다</p>
          <p className="text-[13px] text-[#6b7570] mb-5">아이템을 결제하면 이 목록에서 리포트를 볼 수 있습니다.</p>
          <Button onClick={() => navigate('/home')}>내 아이템으로 이동</Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {reportable.map((a) => {
            const meta = getAnalysisMeta(a.analysisId)
            return (
              <Card key={a.analysisId}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-[#14181a]">{a.itemName}</p>
                    {meta && (
                      <p className="text-[12px] text-[#9aa39e]">
                        {meta.districtName} · {meta.industryName}
                      </p>
                    )}
                  </div>
                  <RiskBadge level={gradeScore('TOTAL', a.totalScore)} />
                </div>
                <p className="text-[26px] font-bold text-[#14181a] mb-3">
                  {a.totalScore} <span className="text-[13px] text-[#9aa39e] font-normal">/ 100</span>
                </p>
                <Link
                  to={`/analyze/${a.analysisId}/report`}
                  className="text-[13px] text-brand-700 font-medium underline"
                >
                  리포트 보기 →
                </Link>
              </Card>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
