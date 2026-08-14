import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'

const PLANS = [
  { plan: 'SINGLE', title: '아이템 1건', desc: '이번 아이템 하나만 · 레이어 전체 · 산출 근거 · 설문지 · 리포트', amount: 9900 },
  { plan: 'PACK3', title: '3건 팩', desc: '건당 8,300원 · 6개월 유효 · 후보를 여러 개 재볼 때', amount: 24900 },
]

export default function Payment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { createPayment, refreshAnalyses, refreshCredits } = useApp()
  const [selected, setSelected] = useState('PACK3')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const plan = PLANS.find((p) => p.plan === selected)

  const handlePay = async () => {
    setSubmitting(true)
    setError('')
    try {
      await createPayment(id, { plan: selected, paymentMethod: 'KAKAOPAY' })
      await refreshAnalyses()
      await refreshCredits()
      navigate(`/analyze/${id}/result`)
    } catch (err) {
      setError(err.message || '결제 처리에 실패했습니다.')
      setSubmitting(false)
    }
  }

  return (
    <AppShell crumb="결제">
      <h1 className="text-[22px] font-bold text-[#14181a] mb-1">결제</h1>
      <p className="text-[13px] text-[#6b7570] mb-6">결제하면 즉시 전체 리포트가 열립니다.</p>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <div>
          <p className="font-semibold text-[#14181a] mb-3">플랜</p>
          <div className="flex flex-col gap-3 mb-5">
            {PLANS.map((p) => (
              <button
                key={p.plan}
                type="button"
                onClick={() => setSelected(p.plan)}
                className={`text-left rounded-xl border px-5 py-4 flex items-center justify-between transition-colors ${
                  selected === p.plan ? 'border-brand-500 bg-brand-50' : 'border-[#e2e6e3] bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      selected === p.plan ? 'border-brand-600' : 'border-[#c3c9c5]'
                    }`}
                  >
                    {selected === p.plan && <span className="w-2 h-2 rounded-full bg-brand-600" />}
                  </span>
                  <div>
                    <p className="font-semibold text-[#14181a]">{p.title}</p>
                    <p className="text-[12px] text-[#6b7570]">{p.desc}</p>
                  </div>
                </div>
                <p className="font-bold text-[#14181a] shrink-0">{p.amount.toLocaleString()}원</p>
              </button>
            ))}
          </div>

          <Card>
            <p className="font-semibold text-[#14181a] mb-3">결제하면 열리는 것</p>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[13px] text-[#4b5450]">
              {[
                'L1·L2·L3 세 레이어 전체 점수와 근거',
                '설문지 자동 생성 (미충족 니즈용)',
                '종합 산출 근거 — 지표 채점표',
                '리포트 화면 열람·인쇄',
                'L3 경쟁 상세 — 점포수·밀도·매출·생존율',
                '진단 결과 90일간 보관',
              ].map((t) => (
                <p key={t} className="flex items-center gap-1.5">
                  <span className="text-brand-600">✓</span> {t}
                </p>
              ))}
            </div>
            <p className="text-[11px] text-[#9aa39e] mt-4 border-t border-[#eef1ef] pt-3">
              설문 배포와 응답 수집은 직접 하셔야 합니다. 저희는 질문지 제작까지만 책임집니다.
            </p>
          </Card>
        </div>

        <Card className="h-fit">
          <p className="font-semibold text-[#14181a] mb-4">주문 요약</p>
          <div className="flex flex-col gap-2 text-[13px] text-[#4b5450] mb-4">
            <div className="flex justify-between">
              <span>{plan.title}</span>
              <span className="font-medium text-[#14181a]">{plan.amount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span>부가세</span>
              <span>포함</span>
            </div>
            {plan.plan === 'PACK3' && (
              <div className="flex justify-between">
                <span>사용 기한</span>
                <span>6개월</span>
              </div>
            )}
          </div>
          <div className="border-t border-[#e2e6e3] pt-4 mb-4 flex justify-between items-baseline">
            <span className="text-[13px] text-[#6b7570]">결제 금액</span>
            <span className="text-[20px] font-bold text-[#14181a]">{plan.amount.toLocaleString()}원</span>
          </div>
          <Button className="w-full" disabled={submitting} onClick={handlePay}>
            {submitting ? '결제 처리 중…' : `${plan.amount.toLocaleString()}원 결제하기`}
          </Button>
          {error && <p className="text-[12px] text-red-500 mt-2 text-center">{error}</p>}
          <p className="text-[11px] text-[#9aa39e] mt-3 text-center">
            실제 결제는 이루어지지 않는 데모용 목업입니다.
          </p>
        </Card>
      </div>
    </AppShell>
  )
}
