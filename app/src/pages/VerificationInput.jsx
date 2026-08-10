import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import { Input, Textarea, FieldError } from '../components/ui/Field'
import { useApp } from '../context/AppContext'

export default function VerificationInput() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getAnalysis, saveVerification } = useApp()
  const analysis = getAnalysis(id)

  const questionnaireId =
    searchParams.get('qid') || analysis?.questionnaires[analysis.questionnaires.length - 1]?.id

  const questionnaire = analysis?.questionnaires.find((q) => q.id === questionnaireId)

  const [answers, setAnswers] = useState({})
  const [errors, setErrors] = useState({})

  const targetHypotheses = useMemo(
    () =>
      analysis?.diagnosis?.hypotheses.filter((h) =>
        questionnaire?.hypothesisIds.includes(h.id),
      ) ?? [],
    [analysis, questionnaire],
  )

  if (!analysis || !analysis.diagnosis) {
    return (
      <AppLayout>
        <Card>조회할 수 있는 진단 결과가 없습니다.</Card>
      </AppLayout>
    )
  }

  if (!questionnaire) {
    return (
      <AppLayout>
        <Card>
          <p className="font-semibold text-[#333] mb-2">연결된 질문지가 없습니다</p>
          <p className="text-[13px] text-[#666] mb-4">
            먼저 미검증 가설을 선택해 질문지를 생성한 뒤 검증 결과를 입력할 수 있습니다.
          </p>
          <Button onClick={() => navigate(`/analyze/${id}/hypotheses`)}>가설 목록으로 이동</Button>
        </Card>
      </AppLayout>
    )
  }

  const updateAnswer = (qId, field, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: { ...prev[qId], [field]: value } }))
  }

  const handleSubmit = () => {
    const nextErrors = {}
    questionnaire.items.forEach((item) => {
      const a = answers[item.id] || {}
      if (!a.summary?.trim()) nextErrors[`${item.id}-summary`] = '응답 요약을 입력해 주세요.'
      if (!a.count || Number(a.count) <= 0) nextErrors[`${item.id}-count`] = '응답 수를 입력해 주세요.'
    })
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    setErrors({})
    const responses = questionnaire.items.map((item) => ({
      questionId: item.id,
      question: item.question,
      summary: answers[item.id]?.summary || '',
      count: Number(answers[item.id]?.count) || 0,
      observation: answers[item.id]?.observation || '',
    }))
    saveVerification(id, { questionnaireId: questionnaire.id, responses })
    navigate(`/analyze/${id}/verify/result?qid=${questionnaire.id}`)
  }

  return (
    <AppLayout>
      <h1 className="text-[20px] font-bold text-[#171719] mb-5">검증 결과 입력</h1>

      <Card className="mb-4">
        <p className="font-semibold text-[#333] mb-3">검증 대상 가설</p>
        <p className="text-[12px] text-[#666] mb-3">
          외부 채널(인터뷰·설문)에서 수집한 결과를 아래에 입력하면 해당 가설의 검증 상태가
          갱신됩니다.
        </p>
        <div className="flex flex-col gap-2">
          {targetHypotheses.map((h) => (
            <div key={h.id}>
              <p className="text-[12px] text-[#333] mb-1">{h.title}</p>
              <ProgressBar percent={30} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-4">
        <p className="font-semibold text-[#333] mb-1">수요 레이어 반영 안내</p>
        <p className="text-[13px] text-[#666] leading-relaxed">
          응답 수가 많을수록, 핵심 관찰이 구체적일수록 검증 수준 점수가 높아집니다. 응답자
          모집·설문 발송은 이 서비스에서 제공하지 않으며, 사용자가 직접 수집한 결과만
          반영됩니다.
        </p>
      </Card>

      <p className="font-semibold text-[#333] mb-3">질문별 검증 결과</p>
      <div className="flex flex-col gap-3 mb-5">
        {questionnaire.items.map((item, idx) => (
          <Card key={item.id}>
            <p className="text-[13px] font-medium text-[#333] mb-3">
              질문 {idx + 1}. {item.question}
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[12px] text-[#666] mb-1">응답 요약을 입력하세요 *</label>
                <Input
                  value={answers[item.id]?.summary || ''}
                  error={errors[`${item.id}-summary`]}
                  onChange={(e) => updateAnswer(item.id, 'summary', e.target.value)}
                />
                <FieldError>{errors[`${item.id}-summary`]}</FieldError>
              </div>
              <div>
                <label className="block text-[12px] text-[#666] mb-1">응답 수 *</label>
                <Input
                  type="number"
                  min="0"
                  value={answers[item.id]?.count || ''}
                  error={errors[`${item.id}-count`]}
                  onChange={(e) => updateAnswer(item.id, 'count', e.target.value)}
                />
                <FieldError>{errors[`${item.id}-count`]}</FieldError>
              </div>
            </div>
            <label className="block text-[12px] text-[#666] mb-1">핵심 관찰 내용</label>
            <Textarea
              rows={3}
              placeholder="핵심 관찰 내용"
              value={answers[item.id]?.observation || ''}
              onChange={(e) => updateAnswer(item.id, 'observation', e.target.value)}
            />
          </Card>
        ))}
      </div>
      <p className="text-[12px] text-[#999] mb-6">
        * 표시 항목은 필수 입력입니다. 필수 항목이 누락된 경우 저장되지 않습니다.
      </p>

      <div className="flex justify-end">
        <Button onClick={handleSubmit}>검증 결과 저장 및 수요 진단 갱신</Button>
      </div>
    </AppLayout>
  )
}
