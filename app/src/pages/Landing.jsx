import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const INTRO_CARDS = [
  {
    title: '종합 리스크 점수',
    body: '시장·경쟁·타이밍·수요 4개 레이어를 종합해 100점 기준 리스크 점수를 산출합니다. 점수는 시장 진출 가능 여부를 단정하지 않으며, 현재 확보된 근거와 남은 검증 과제를 보여 주는 진단 지표입니다.',
  },
  {
    title: '레이어별 핵심 요인 분석',
    body: '각 레이어는 점수에 영향을 준 핵심 요인과 리스크 수준을 함께 제공해, 무엇이 점수를 움직였는지 이해할 수 있게 합니다.',
  },
  {
    title: '수요는 검증 수준으로 표현',
    body: '수요는 인터넷 데이터만으로 확정하지 않습니다. 대신 현재 검증 수준과 확인이 필요한 미검증 가설로 제시합니다.',
  },
]

const EVIDENCE_CARDS = [
  { title: '출처·기준 시점 명시', body: '각 핵심 요인에 활용된 데이터 또는 관찰 근거의 출처와 기준 시점을 함께 표시합니다.' },
  { title: '미검증 가설 별도 식별', body: '고객 인터뷰·설문으로 직접 확인해야 할 핵심 가설을 다른 진단 근거와 구분해 보여줍니다.' },
]

const ACTION_CARDS = [
  { title: '행동 기반 검증 질문지 생성', body: '미검증 가설을 선택하면 과거 경험과 실제 행동을 확인하는 질문지를 자동으로 생성합니다.' },
  { title: '외부 검증 결과 반영', body: '직접 수집한 인터뷰·설문 결과를 입력하면 수요 레이어 점수와 검증 상태가 갱신됩니다.' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="border-b border-[#d0d0d0] bg-white">
        <div className="max-w-[1200px] mx-auto flex items-center justify-center h-14">
          <span className="text-[16px] font-semibold text-[#333]">시장검증</span>
        </div>
      </header>

      <div className="max-w-[900px] mx-auto px-6 py-16 text-center">
        <h1 className="text-[28px] font-bold text-[#171719] leading-tight">
          근거 없는 확신 대신, 검증 가능한 판단 기준을
        </h1>
        <p className="mt-4 text-[16px] font-semibold text-[#555]">
          아이템의 시장·경쟁·타이밍·수요를 4개 레이어로 진단하고, 미검증 가설을 실제 고객 조사로
          연결합니다.
        </p>
        <Button className="mt-8" onClick={() => navigate('/home')}>
          분석 시작하기
        </Button>
      </div>

      <section className="max-w-[1100px] mx-auto px-6 pb-4">
        <h2 className="text-center text-[20px] font-semibold text-[#171719] mb-6">
          시장 리스크 진단이란?
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {INTRO_CARDS.map((c) => (
            <Card key={c.title} className="text-left">
              <p className="font-semibold text-[#333] mb-2">{c.title}</p>
              <p className="text-[13px] text-[#666] leading-relaxed">{c.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-6 py-10">
        <h2 className="text-center text-[20px] font-semibold text-[#171719] mb-6">
          신뢰할 수 있는 근거 공개
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {EVIDENCE_CARDS.map((c) => (
            <Card key={c.title} className="text-left">
              <p className="font-semibold text-[#333] mb-2">{c.title}</p>
              <p className="text-[13px] text-[#666] leading-relaxed">{c.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-6 py-10">
        <h2 className="text-center text-[20px] font-semibold text-[#171719] mb-6">
          직접 검증하고 진단을 갱신하세요
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {ACTION_CARDS.map((c) => (
            <Card key={c.title} className="text-left">
              <p className="font-semibold text-[#333] mb-2">{c.title}</p>
              <p className="text-[13px] text-[#666] leading-relaxed">{c.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-[900px] mx-auto px-6 py-16 text-center">
        <p className="text-[18px] font-semibold text-[#171719]">
          지금 바로 첫 아이템 분석을 시작해 보세요
        </p>
        <p className="mt-2 text-[14px] text-[#666]">
          이미 진행 중인 분석이 있다면 대시보드에서 확인할 수 있습니다.
        </p>
      </section>
    </div>
  )
}
