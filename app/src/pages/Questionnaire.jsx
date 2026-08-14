import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'

export default function Questionnaire() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getEvidence, createQuestionnaire, getDiagnosis } = useApp()
  const [hypotheses, setHypotheses] = useState([])
  const [itemName, setItemName] = useState('')
  const [selected, setSelected] = useState([])
  const [type, setType] = useState('INTERVIEW')
  const [questionnaire, setQuestionnaire] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getEvidence(id).then((ev) => {
      setHypotheses(ev.unverifiedHypotheses)
      setSelected(ev.unverifiedHypotheses.map((h) => h.hypothesisId))
      setLoaded(true)
    })
    getDiagnosis(id).then((d) => setItemName(d.itemName))
  }, [id, getEvidence, getDiagnosis])

  const toggle = (hid) => {
    setSelected((prev) => (prev.includes(hid) ? prev.filter((x) => x !== hid) : [...prev, hid]))
  }

  const previewScore = useMemo(() => 59 + selected.length * 4, [selected.length])

  const handleGenerate = async () => {
    if (selected.length === 0) {
      setError('최소 1개 이상의 항목을 선택해야 질문지를 생성할 수 있습니다.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const q = await createQuestionnaire(id, { hypothesisIds: selected, type })
      setQuestionnaire(q)
    } catch (err) {
      if (err.code === 'PAYMENT_REQUIRED') {
        navigate(`/analyze/${id}/payment`)
        return
      }
      setError(err.message || '질문지 생성에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (questionnaire) {
    return (
      <AppShell crumb="설문지">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <h1 className="text-[22px] font-bold text-[#14181a]">설문지가 만들어졌습니다</h1>
          <Button variant="secondary" onClick={() => window.print()}>
            설문지 내려받기
          </Button>
        </div>
        <p className="text-[13px] text-[#6b7570] mb-6">
          비어 있던 미충족 니즈를 그대로 질문으로 옮겼습니다. 배포와 응답 수집은 직접 하시면 됩니다.
        </p>

        <div className="grid lg:grid-cols-[1fr_300px] gap-5">
          <div className="flex flex-col gap-4">
            {questionnaire.items.map((it) => (
              <Card key={it.itemId}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-semibold text-brand-700">Q{it.order}</span>
                </div>
                <p className="text-[14px] text-[#14181a] leading-relaxed mb-2">{it.questionText}</p>
                <p className="text-[11px] text-[#9aa39e]">검증 목적: {it.purpose}</p>
              </Card>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <p className="font-semibold text-[#14181a] mb-3">설문 개요</p>
              <div className="flex flex-col gap-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[#9aa39e]">질문 수</span>
                  <span className="font-medium text-[#14181a]">{questionnaire.items.length}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9aa39e]">예상 소요</span>
                  <span className="font-medium text-[#14181a]">2분</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9aa39e]">권장 응답</span>
                  <span className="font-medium text-[#14181a]">100건</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9aa39e]">유도질문</span>
                  <span className="font-medium text-[#14181a]">0건</span>
                </div>
              </div>
            </Card>

            <Card className={questionnaire.leadingQuestionCheck.passed ? 'border-brand-300 bg-brand-50' : ''}>
              <p className="font-semibold text-[#14181a] mb-2 flex items-center gap-1.5">
                <span className="text-brand-600">✓</span> 유도질문 검사 통과
              </p>
              <p className="text-[12px] text-[#4b5450] leading-relaxed">{questionnaire.leadingQuestionCheck.summary}</p>
            </Card>

            <Button className="w-full" onClick={() => navigate(`/analyze/${id}/report`)}>
              리포트 보기 →
            </Button>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!loaded) {
    return (
      <AppShell crumb="설문지 만들기">
        <p className="text-[13px] text-[#9aa39e]">불러오는 중…</p>
      </AppShell>
    )
  }

  return (
    <AppShell crumb="설문지 만들기">
      <h1 className="text-[22px] font-bold text-[#14181a] mb-1">설문지 만들기</h1>
      <p className="text-[13px] text-[#6b7570] mb-6">
        데이터로 채울 수 없던 항목을 선택하면, 과거 경험·실제 행동을 확인하는 질문지를 생성합니다.
      </p>

      <Card className="mb-4">
        <p className="font-semibold text-[#14181a] mb-3">1단계 — 확인할 항목 선택</p>
        <div className="flex flex-col gap-2">
          {hypotheses.map((h) => (
            <label
              key={h.hypothesisId}
              className="flex items-start gap-3 border border-[#e2e6e3] rounded-lg px-3 py-2.5 cursor-pointer"
            >
              <input
                type="checkbox"
                className="mt-1 accent-emerald-600"
                checked={selected.includes(h.hypothesisId)}
                onChange={() => toggle(h.hypothesisId)}
              />
              <span className="text-[13px] text-[#14181a] leading-relaxed">{h.description}</span>
            </label>
          ))}
        </div>
        {error && <p className="text-[12px] text-red-500 mt-3">{error}</p>}
      </Card>

      <Card className="mb-4">
        <p className="font-semibold text-[#14181a] mb-3">2단계 — 조사 유형 선택</p>
        <div className="flex flex-col gap-2">
          {[
            { value: 'INTERVIEW', label: '인터뷰용', desc: '대화형 심층 탐색 질문 (개방형 문항 중심)' },
            { value: 'SURVEY', label: '설문용', desc: '구조화된 단답형 질문 (척도·선택 문항 중심)' },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex items-start gap-3 border border-[#e2e6e3] rounded-lg px-3 py-2.5 cursor-pointer"
            >
              <input
                type="radio"
                name="qtype"
                className="mt-1 accent-emerald-600"
                checked={type === opt.value}
                onChange={() => setType(opt.value)}
              />
              <span className="text-[13px] text-[#14181a]">
                <span className="font-medium">{opt.label}</span> — {opt.desc}
              </span>
            </label>
          ))}
        </div>
      </Card>

      <Card className="mb-6 !bg-brand-50 border-brand-200">
        <p className="text-[13px] text-brand-800">
          응답 {previewScore >= 71 ? 100 : 100}건 반영 시 예상 <span className="font-bold">59 → {previewScore}</span>{' '}
          까지 오를 수 있습니다. (질문지 생성까지가 서비스 범위이며, 실제 반영은 이 앱 밖에서 이루어집니다.)
        </p>
      </Card>

      <div className="flex justify-end">
        <Button disabled={submitting} onClick={handleGenerate}>
          {submitting ? '생성 중…' : '설문지 생성'}
        </Button>
      </div>
    </AppShell>
  )
}
