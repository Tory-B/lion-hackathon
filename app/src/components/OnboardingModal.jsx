import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './ui/Button'
import IndustryPicker from './IndustryPicker'
import { Label, Input, Textarea, FieldError } from './ui/Field'
import { DISTRICTS } from '../data/districts'
import { useApp } from '../context/AppContext'

export default function OnboardingModal({
  initialIndustryCode = '',
  initialIndustryName = '',
  initialDistrictCode = '',
  onClose,
}) {
  const navigate = useNavigate()
  const { createAnalysis, refreshAnalyses } = useApp()

  const [industryCode, setIndustryCode] = useState(initialIndustryCode)
  const [industryName, setIndustryName] = useState(initialIndustryName)
  // 랜딩에서 이미 업종을 골라 넘어온 경우 다시 물어보지 않는다 (팀 피드백).
  // "변경" 누르면 그때만 선택지를 다시 펼친다.
  const [changingIndustry, setChangingIndustry] = useState(!initialIndustryCode)
  const [districtCode, setDistrictCode] = useState(initialDistrictCode)
  const [itemName, setItemName] = useState(initialIndustryName)
  const [problem, setProblem] = useState('')
  const [targetCustomer, setTargetCustomer] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const pickIndustry = (industry) => {
    setIndustryCode(industry.industryCode)
    setIndustryName(industry.industryName)
    setChangingIndustry(false)
    if (!itemName) setItemName(industry.industryName)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = {}
    if (!industryCode) nextErrors.industry = '업종을 선택해 주세요.'
    if (!districtCode) nextErrors.district = '자치구를 선택해 주세요.'
    if (!itemName.trim()) nextErrors.itemName = '아이템명을 입력해 주세요.'
    if (!problem.trim()) nextErrors.problem = '해결하려는 문제를 입력해 주세요.'
    if (!targetCustomer.trim()) nextErrors.targetCustomer = '예상 고객을 입력해 주세요.'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    setSubmitting(true)
    try {
      const res = await createAnalysis({
        itemName: itemName.trim(),
        industryCode,
        problem: problem.trim(),
        targetCustomer: targetCustomer.trim(),
        deliveryMethod: '',
        regionSggCode: districtCode,
      })
      await refreshAnalyses()
      navigate(`/analyze/${res.analysisId}/progress`)
    } catch (err) {
      setErrors({ submit: err.message || '분석 요청에 실패했습니다.' })
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-[560px] p-6 sm:p-7">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[18px] font-bold text-[#14181a]">아이템 진단 시작하기</h2>
          <button type="button" onClick={onClose} className="text-[#9aa39e] hover:text-[#14181a] text-xl leading-none">
            ×
          </button>
        </div>
        <p className="text-[13px] text-[#6b7570] mb-5">
          업종·지역·문제를 입력하면 시장·고객·경쟁 세 레이어로 진단합니다.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label required>업종</Label>
            {!changingIndustry && industryCode ? (
              <div className="flex items-center justify-between rounded-lg border border-[#d8ddda] px-3 py-2.5">
                <span className="text-sm text-[#14181a]">{industryName}</span>
                <button
                  type="button"
                  onClick={() => setChangingIndustry(true)}
                  className="text-[12px] text-brand-700 underline"
                >
                  변경
                </button>
              </div>
            ) : (
              <IndustryPicker selectedCode={industryCode} onSelect={pickIndustry} />
            )}
            <FieldError>{errors.industry}</FieldError>
          </div>

          <div>
            <Label required>자치구</Label>
            <select
              className="w-full rounded-lg border border-[#d8ddda] px-3 py-2.5 text-sm text-[#14181a] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              value={districtCode}
              onChange={(e) => setDistrictCode(e.target.value)}
            >
              <option value="">자치구를 선택하세요</option>
              {DISTRICTS.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
            <FieldError>{errors.district}</FieldError>
          </div>

          <div>
            <Label required>아이템명</Label>
            <Input
              placeholder="예: 대형견 전용 셀프 목욕 카페"
              value={itemName}
              error={errors.itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <FieldError>{errors.itemName}</FieldError>
          </div>

          <div>
            <Label required>해결하려는 문제</Label>
            <Textarea
              rows={2}
              placeholder="예: 집에서 대형견 목욕시키기가 힘들다"
              value={problem}
              error={errors.problem}
              onChange={(e) => setProblem(e.target.value)}
            />
            <FieldError>{errors.problem}</FieldError>
          </div>

          <div>
            <Label required>예상 고객</Label>
            <Textarea
              rows={2}
              placeholder="예: 대형견을 키우는 1인 가구"
              value={targetCustomer}
              error={errors.targetCustomer}
              onChange={(e) => setTargetCustomer(e.target.value)}
            />
            <FieldError>{errors.targetCustomer}</FieldError>
          </div>

          {errors.submit && <p className="text-[13px] text-red-500">{errors.submit}</p>}

          <Button type="submit" disabled={submitting} className="mt-1">
            {submitting ? '요청 중…' : '무료로 진단하기'}
          </Button>
        </form>
      </div>
    </div>
  )
}
