import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Label, Input, Textarea, FieldError } from '../components/ui/Field'
import { useApp } from '../context/AppContext'

const FIELDS = [
  {
    key: 'itemName',
    label: '아이템명',
    placeholder: '예: 시니어 대상 약 복용 알림 앱',
    type: 'input',
  },
  {
    key: 'problem',
    label: '해결하려는 문제',
    placeholder: '예: 고령자가 약 복용 시간을 자주 잊어 복약 순응도가 낮다',
    type: 'textarea',
  },
  {
    key: 'customer',
    label: '예상 고객',
    placeholder: '예: 만성질환을 보유한 65세 이상 고령자 및 보호자',
    type: 'textarea',
  },
  {
    key: 'method',
    label: '제공 방식',
    placeholder: '예: 모바일 앱 + 보호자 알림 연동 서비스',
    type: 'textarea',
  },
]

export default function ItemInput() {
  const [values, setValues] = useState({ itemName: '', problem: '', customer: '', method: '' })
  const [errors, setErrors] = useState({})
  const { createAnalysis } = useApp()
  const navigate = useNavigate()

  const handleChange = (key) => (e) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const nextErrors = {}
    FIELDS.forEach((f) => {
      if (!values[f.key].trim()) nextErrors[f.key] = `${f.label}을 입력해 주세요.`
    })
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    const id = createAnalysis(values)
    navigate(`/analyze/${id}/progress`)
  }

  return (
    <AppLayout>
      <h1 className="text-[20px] font-bold text-[#171719] mb-1">새 아이템 분석 요청</h1>
      <p className="text-[13px] text-[#666] mb-6">
        아래 항목을 모두 입력하면 시장·경쟁·타이밍·수요 4개 레이어 리스크 진단이 시작됩니다.
      </p>

      <form onSubmit={handleSubmit}>
        <Card className="flex flex-col gap-5">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <Label required>{f.label}</Label>
              {f.type === 'input' ? (
                <Input
                  placeholder={f.placeholder}
                  value={values[f.key]}
                  error={errors[f.key]}
                  onChange={handleChange(f.key)}
                />
              ) : (
                <Textarea
                  rows={3}
                  placeholder={f.placeholder}
                  value={values[f.key]}
                  error={errors[f.key]}
                  onChange={handleChange(f.key)}
                />
              )}
              <FieldError>{errors[f.key]}</FieldError>
            </div>
          ))}
        </Card>

        <Card className="mt-4">
          <p className="font-semibold text-[#333] mb-2">입력 전 확인 사항</p>
          <ul className="text-[13px] text-[#666] leading-relaxed list-disc pl-5 space-y-1">
            <li>아이템명은 서비스나 제품을 지칭할 수 있는 구체적인 명칭으로 입력하세요.</li>
            <li>해결하려는 문제는 실제 관찰되거나 경험한 상황을 구체적으로 작성하세요.</li>
            <li>예상 고객은 연령, 직군, 상황 등 특징을 포함해 작성하세요.</li>
            <li>제공 방식은 전달 채널과 형태(앱, 웹, 오프라인 등)를 명시하세요.</li>
          </ul>
        </Card>

        <div className="flex items-center justify-end mt-5">
          <Button type="submit">분석 요청 제출</Button>
        </div>
      </form>
    </AppLayout>
  )
}
