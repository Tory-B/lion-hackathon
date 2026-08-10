import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'

export default function QuestionnaireGenerate() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getAnalysis, generateQuestionnaireFor } = useApp()
  const analysis = getAnalysis(id)

  const preselected = searchParams.get('hyp')
  const [selected, setSelected] = useState(() => (preselected ? [preselected] : []))
  const [type, setType] = useState('interview')
  const [error, setError] = useState('')

  const hypotheses = useMemo(
    () => analysis?.diagnosis?.hypotheses.filter((h) => h.status !== 'verified') ?? [],
    [analysis],
  )

  if (!analysis || !analysis.diagnosis) {
    return (
      <AppLayout>
        <Card>조회할 수 있는 진단 결과가 없습니다.</Card>
      </AppLayout>
    )
  }

  const toggle = (hypId) => {
    setSelected((prev) => (prev.includes(hypId) ? prev.filter((x) => x !== hypId) : [...prev, hypId]))
  }

  const handleGenerate = () => {
    if (selected.length === 0) {
      setError('최소 1개 이상의 가설을 선택해야 질문지를 생성할 수 있습니다.')
      return
    }
    setError('')
    const qId = generateQuestionnaireFor(id, { type, hypothesisIds: selected })
    navigate(`/analyze/${id}/questionnaire/${qId}`)
  }

  return (
    <AppLayout>
      <h1 className="text-[20px] font-bold text-[#171719] mb-1">질문지 생성</h1>
      <p className="text-[13px] text-[#666] mb-6">
        미검증 가설을 선택하고 조사 유형을 지정하면, 과거 경험과 실제 행동을 확인하는 질문지를
        생성합니다.
      </p>

      <Card className="mb-4">
        <p className="font-semibold text-[#333] mb-3">1단계 — 검증할 가설 선택</p>
        <div className="flex flex-col gap-2.5">
          {hypotheses.map((h) => (
            <label
              key={h.id}
              className="flex items-start gap-3 cursor-pointer border border-[#eee] rounded-md px-3 py-2.5"
            >
              <span
                onClick={(e) => {
                  e.preventDefault()
                  toggle(h.id)
                }}
                className={`mt-0.5 w-4 h-4 rounded shrink-0 border flex items-center justify-center ${
                  selected.includes(h.id) ? 'bg-[#333] border-[#333]' : 'border-[#ccc]'
                }`}
              >
                {selected.includes(h.id) && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </span>
              <span className="text-[13px] text-[#333] leading-relaxed">{h.title}</span>
            </label>
          ))}
        </div>
        {error && <p className="text-[12px] text-red-500 mt-3">{error}</p>}
        {!error && (
          <p className="text-[12px] text-[#999] mt-3">
            최소 1개 이상의 가설을 선택해야 질문지를 생성할 수 있습니다.
          </p>
        )}
      </Card>

      <Card className="mb-4">
        <p className="font-semibold text-[#333] mb-3">2단계 — 조사 유형 선택</p>
        <div className="flex flex-col gap-2.5">
          {[
            { value: 'interview', label: '인터뷰용', desc: '대화형 심층 탐색 질문 (개방형 문항 중심)' },
            { value: 'survey', label: '설문용', desc: '구조화된 단답형 질문 (척도·선택 문항 중심)' },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex items-start gap-3 cursor-pointer border border-[#eee] rounded-md px-3 py-2.5"
            >
              <input
                type="radio"
                name="qtype"
                className="mt-1"
                checked={type === opt.value}
                onChange={() => setType(opt.value)}
              />
              <span className="text-[13px] text-[#333]">
                <span className="font-medium">{opt.label}</span> — {opt.desc}
              </span>
            </label>
          ))}
        </div>
      </Card>

      <Card className="mb-6">
        <p className="font-semibold text-[#333] mb-2">생성 범위 안내</p>
        <ul className="text-[13px] text-[#666] leading-relaxed list-disc pl-5 space-y-1">
          <li>각 문항에는 검증하려는 가설 또는 확인 목적이 함께 표시됩니다.</li>
          <li>과거 문제 경험, 현재 해결 방식, 발생 빈도, 실제 지출 또는 행동을 확인하는 문항으로 구성됩니다.</li>
          <li>제품 호감도나 서비스 이용 의향을 직접 묻는 문항은 기본 문항으로 포함하지 않습니다.</li>
        </ul>
      </Card>

      <div className="flex items-center justify-between">
        <Link to={`/analyze/${id}/hypotheses`} className="text-[13px] text-[#666] underline">
          미검증 가설 목록으로
        </Link>
        <Button onClick={handleGenerate}>질문지 생성</Button>
      </div>
    </AppLayout>
  )
}
