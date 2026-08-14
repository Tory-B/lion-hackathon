import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import RiskBadge from '../components/ui/RiskBadge'
import ProgressBar from '../components/ui/ProgressBar'
import { useApp } from '../context/AppContext'

const STATUS_LABEL = {
  COMPLETED: '분석 완료',
  IN_PROGRESS: '분석 중',
  PENDING: '대기 중',
  FAILED: '분석 실패',
}

export default function Dashboard() {
  const { analyses, credits, refreshAnalyses, refreshCredits } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    refreshAnalyses()
    refreshCredits()
  }, [refreshAnalyses, refreshCredits])

  const completed = analyses.filter((a) => a.status === 'COMPLETED')
  const avgScore = completed.length
    ? Math.round(completed.reduce((s, a) => s + a.totalScore, 0) / completed.length)
    : null
  const topScore = completed.length ? Math.max(...completed.map((a) => a.totalScore)) : null
  const topItem = completed.find((a) => a.totalScore === topScore)

  return (
    <AppShell crumb="내 아이템">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h1 className="text-[22px] font-bold text-[#14181a]">내 아이템</h1>
        <Button onClick={() => navigate('/')}>+ 새 아이템 진단</Button>
      </div>
      <p className="text-[13px] text-[#6b7570] mb-6">진단한 아이템이 쌓이면 레이어별로 비교할 수 있습니다.</p>

      {credits.remainingCredits > 0 && (
        <Card className="mb-4 !bg-brand-50 border-brand-200">
          <p className="text-[13px] text-brand-800">
            잔여 크레딧 <span className="font-bold">{credits.remainingCredits}건</span> · 다음 진단부터 자동으로
            전체가 열립니다 (유효기간{' '}
            {credits.expiresAt ? new Date(credits.expiresAt).toLocaleDateString('ko-KR') : '-'}까지)
          </p>
        </Card>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-[12px] text-[#9aa39e] mb-1">평균 점수</p>
          <p className="text-[24px] font-bold text-[#14181a]">
            {avgScore ?? '-'} <span className="text-[14px] text-[#9aa39e] font-normal">/ 100</span>
          </p>
        </Card>
        <Card>
          <p className="text-[12px] text-[#9aa39e] mb-1">진단한 아이템</p>
          <p className="text-[24px] font-bold text-[#14181a]">
            {analyses.length}
            <span className="text-[14px] text-[#9aa39e] font-normal"> 개</span>
          </p>
        </Card>
        <Card>
          <p className="text-[12px] text-[#9aa39e] mb-1">가장 높은 점수</p>
          <p className="text-[24px] font-bold text-[#14181a]">
            {topScore ?? '-'} <span className="text-[14px] text-[#9aa39e] font-normal">{topItem?.itemName}</span>
          </p>
        </Card>
      </div>

      {analyses.length === 0 ? (
        <Card className="text-center py-14">
          <p className="font-semibold text-[#14181a] mb-2">아직 진단한 아이템이 없습니다</p>
          <p className="text-[13px] text-[#6b7570] mb-5">새 아이템을 진단하면 이 목록에서 확인할 수 있습니다.</p>
          <Button onClick={() => navigate('/')}>+ 새 아이템 진단</Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {analyses.map((a) => (
            <Card key={a.analysisId}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <p className="font-semibold text-[#14181a]">{a.itemName || a.industryName}</p>
                  <p className="text-[12px] text-[#9aa39e]">
                    {a.districtName} {a.industryName}
                  </p>
                </div>
                {a.status === 'COMPLETED' ? (
                  <RiskBadge level={a.totalRisk} />
                ) : (
                  <span className="text-[12px] text-[#9aa39e]">{STATUS_LABEL[a.status]}</span>
                )}
              </div>

              {a.status === 'COMPLETED' ? (
                <>
                  <p className="text-[30px] font-bold text-[#14181a] mt-2">
                    {a.totalScore} <span className="text-[14px] text-[#9aa39e] font-normal">/ 100</span>
                  </p>
                  <ProgressBar percent={a.totalScore} className="mt-2 mb-3" />
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] text-[#9aa39e]">
                      {a.paymentStatus === 'PAID' ? '전체 열람' : '무료 · 총점만'}
                    </p>
                    <Link
                      to={`/analyze/${a.analysisId}/result`}
                      className="text-[13px] text-brand-700 font-medium underline"
                    >
                      결과 보기 →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="mt-3">
                  <Link to={`/analyze/${a.analysisId}/progress`} className="text-[13px] text-brand-700 underline">
                    진단 진행 상황 보기 →
                  </Link>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      <p className="text-[11px] text-[#9aa39e] mt-6">진단 결과는 90일간 보관됩니다.</p>
    </AppShell>
  )
}
