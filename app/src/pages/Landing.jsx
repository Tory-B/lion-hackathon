import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import OnboardingModal from '../components/OnboardingModal'
import IndustryPicker from '../components/IndustryPicker'

const LAYER_CARDS = [
  {
    tag: 'L1',
    title: '시장 규모·성장률',
    desc: '시장이 충분히 크고 자라는가',
    points: ['시장 규모·CAGR·5년 추이', '서울 63개 업종 중 백분위'],
  },
  {
    tag: 'L2',
    title: '고객(타겟)',
    desc: '사려는 사람이 실제로 있는가',
    points: ['인구통계·구매행동', '실수요·소비패턴 안정성'],
  },
  {
    tag: 'L3',
    title: '경쟁',
    desc: '이미 포화 상태인가',
    points: ['점포 수·밀도·점포당 매출', '업종별 3년 생존율'],
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [selectedIndustry, setSelectedIndustry] = useState(null)
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="min-h-screen bg-[#f4f6f5]">
      <header className="border-b border-[#e2e6e3] bg-white">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 h-14">
          <Link to="/">
            <Logo />
          </Link>
          <Button variant="secondary" onClick={() => navigate('/home')}>
            내 아이템
          </Button>
        </div>
      </header>

      <div className="max-w-[800px] mx-auto px-6 pt-20 pb-16 text-center">
        <div className="flex justify-center mb-6">
          <img src="/icon.png" alt="suyo" className="w-[96px] h-[96px] object-contain" />
        </div>
        <h1 className="text-[44px] font-bold tracking-tight text-[#14181a]">suyo</h1>
        <p className="mt-5 text-[16px] text-[#4b5450] leading-relaxed">
          창업 아이템을 넣으면 시장·고객·경쟁 세 레이어로 진단합니다.
        </p>

        <div className="mt-8 max-w-[560px] mx-auto text-left">
          <div className="flex items-stretch gap-2">
            <span className="shrink-0 inline-flex items-center justify-center rounded-lg border border-[#d8ddda] bg-white px-4 text-sm text-[#4b5450]">
              서울 전 지역
            </span>
            <div className="flex-1">
              <IndustryPicker selectedCode={selectedIndustry?.industryCode} onSelect={setSelectedIndustry} />
            </div>
          </div>
          <Button onClick={() => setShowModal(true)} className="w-full mt-2">
            무료로 진단하기
          </Button>
        </div>
        <p className="mt-3 text-[12px] text-[#9aa39e]">
          서울 25개 자치구를 진단합니다. 종합 점수는 결제 없이 확인할 수 있습니다.
        </p>
      </div>

      <section className="bg-[#eef1ef] py-16">
        <div className="max-w-[1100px] mx-auto px-6">
          <h2 className="text-center text-[26px] font-bold text-[#14181a] mb-2">세 레이어로 나눠 봅니다</h2>
          <p className="text-center text-[14px] text-[#6b7570] mb-8">
            고객이 먼저입니다. 시장이 커도 살 사람이 없으면 의미가 없습니다.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {LAYER_CARDS.map((c) => (
              <Card key={c.tag}>
                <span className="inline-flex items-center h-6 px-2 rounded bg-ink-900 text-white text-[11px] font-bold mb-3">
                  {c.tag}
                </span>
                <p className="font-semibold text-[#14181a] mb-1">{c.title}</p>
                <p className="text-[13px] text-[#6b7570] mb-3">{c.desc}</p>
                <div className="border-t border-[#e2e6e3] pt-3 flex flex-col gap-1.5">
                  {c.points.map((p) => (
                    <p key={p} className="text-[12px] text-[#4b5450] flex items-center gap-1.5">
                      <span className="text-brand-600">✓</span> {p}
                    </p>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-[24px] font-bold text-[#14181a] mb-3">조사 대행 한 번 값이면 40번 봅니다</h2>
          <p className="text-[14px] text-[#6b7570] mb-8">
            상권 데이터 조회는 공공 서비스로도 무료입니다. 저희가 값을 받는 건 백분위 채점과 유사기업 대조입니다.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <p className="text-[13px] text-[#9aa39e] mb-2">무료</p>
              <p className="text-[26px] font-bold text-[#14181a] mb-3">0원</p>
              <p className="text-[12px] text-[#6b7570] mb-4">종합 점수와 등급까지 결제 없이 확인</p>
              <Button variant="secondary" className="w-full" onClick={() => setShowModal(true)}>
                지금 진단하기
              </Button>
            </Card>
            <Card>
              <p className="text-[13px] text-[#9aa39e] mb-2">아이템 1건</p>
              <p className="text-[26px] font-bold text-[#14181a] mb-3">9,900원</p>
              <p className="text-[12px] text-[#6b7570] mb-4">3개 레이어 전체 · 근거 · 질문지 · 리포트</p>
              <Button variant="secondary" className="w-full" onClick={() => setShowModal(true)}>
                진단부터 시작
              </Button>
            </Card>
            <Card className="!bg-ink-900 text-white">
              <p className="text-[13px] text-white/60 mb-2">3건 팩 · 추천</p>
              <p className="text-[26px] font-bold mb-3">24,900원</p>
              <p className="text-[12px] text-white/70 mb-4">건당 8,300원 · 6개월 유효 · 후보 여러 개 비교</p>
              <Button className="w-full" onClick={() => setShowModal(true)}>
                진단부터 시작
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {showModal && (
        <OnboardingModal
          initialIndustryCode={selectedIndustry?.industryCode}
          initialIndustryName={selectedIndustry?.industryName}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
