import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'

const STEPS = [
  {
    title: '시장 데이터 수집',
    done: '관련 시장 규모 및 트렌드 데이터를 확인했습니다.',
    doing: '관련 시장 규모 및 트렌드 데이터를 수집하고 있습니다.',
  },
  {
    title: '경쟁 환경 분석',
    done: '유사 서비스 및 경쟁사 포지션 분석을 완료했습니다.',
    doing: '유사 서비스 및 경쟁사 포지션을 분석하고 있습니다.',
  },
  {
    title: '타이밍 레이어 분석',
    done: '검색·트렌드 데이터를 기반으로 진입 시점을 분석했습니다.',
    doing: '검색·트렌드 데이터를 기반으로 진입 시점을 분석하고 있습니다.',
  },
  {
    title: '수요 검증 수준 평가',
    done: '데이터로 확인되지 않는 수요 가설을 식별했습니다.',
    doing: '데이터로 확인되지 않는 수요 가설을 식별하고 있습니다.',
  },
  {
    title: '종합 리스크 점수 산출',
    done: '레이어별 점수를 종합해 리스크 점수를 산출했습니다.',
    doing: '레이어별 점수를 종합하고 있습니다.',
  },
]

export default function AnalysisProgress() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getAnalysis, advanceProgress } = useApp()
  const analysis = getAnalysis(id)

  useEffect(() => {
    if (!analysis || analysis.status !== 'processing') return
    const timer = setInterval(() => advanceProgress(id), 700)
    return () => clearInterval(timer)
  }, [id, analysis?.status, advanceProgress])

  if (!analysis) {
    return (
      <AppLayout>
        <Card>존재하지 않는 분석 요청입니다.</Card>
      </AppLayout>
    )
  }

  const step = analysis.progressStep
  const done = analysis.status === 'done'

  return (
    <AppLayout>
      <h1 className="text-[20px] font-bold text-[#171719] mb-5">분석 진행 상태</h1>

      <Card className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <p className="font-semibold text-[#333]">{done ? '분석 완료' : '분석 진행 중'}</p>
          <p className="text-[13px] text-[#666] mt-1">
            {done
              ? '시장 데이터 수집과 리스크 분석을 완료했습니다.'
              : '시장 데이터 수집과 리스크 분석을 수행하고 있습니다. 잠시 기다려 주세요.'}
          </p>
        </div>
        <p className="text-[13px] text-[#999]">{done ? '분석 완료' : '예상 완료까지 약 2~3분'}</p>
      </Card>

      <Card className="mb-4">
        <p className="font-semibold text-[#333] mb-3">단계별 진행 현황</p>
        <div className="flex flex-col gap-3">
          {STEPS.map((s, idx) => {
            const state = idx < step ? 'done' : idx === step && !done ? 'doing' : idx < step + 1 && done ? 'done' : 'waiting'
            const icon = state === 'done' ? '✓' : state === 'doing' ? '●' : '○'
            return (
              <div key={s.title} className="flex items-start gap-3">
                <span className="w-5 text-[14px] text-[#666] shrink-0">{icon}</span>
                <div>
                  <p className="text-[13px] font-medium text-[#333]">{s.title}</p>
                  <p className="text-[12px] text-[#999]">
                    {state === 'waiting' ? '대기 중입니다.' : state === 'doing' ? s.doing : s.done}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <p className="font-semibold text-[#333] mb-2">완료 후 확인할 수 있는 결과</p>
        <p className="text-[13px] text-[#666] mb-4 leading-relaxed">
          종합 리스크 점수와 시장·경쟁·타이밍·수요 레이어별 점수, 그리고 직접 검증이 필요한
          미검증 가설 목록을 확인할 수 있습니다.
        </p>
        <Button disabled={!done} onClick={() => navigate(`/analyze/${id}/result`)}>
          리스크 진단 결과 보기
        </Button>
      </Card>
    </AppLayout>
  )
}
