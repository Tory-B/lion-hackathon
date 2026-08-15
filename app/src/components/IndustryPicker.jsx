import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'

// 팀 피드백: 자르지 말고 업종 전체 목록을 보여주고, 대분류를 고르면 관련 소분류를
// "아이템명" 선택지로 바로 쓸 수 있게 해달라는 요청 반영. 대분류 선택 → 소분류(=구체
// 업종) 목록에서 고르면 industryCode가 정해지고, 그 이름이 아이템명 초안으로도 쓰인다.
export default function IndustryPicker({ selectedCode, onSelect }) {
  const { getIndustries } = useApp()
  const [groups, setGroups] = useState([])
  const [largeCategory, setLargeCategory] = useState('')

  useEffect(() => {
    getIndustries().then((res) => {
      setGroups(res.groups)
      if (selectedCode) {
        const group = res.groups.find((g) => g.industries.some((i) => i.industryCode === selectedCode))
        if (group) setLargeCategory(group.largeCategory)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getIndustries])

  const currentGroup = groups.find((g) => g.largeCategory === largeCategory)

  return (
    <div className="flex flex-col gap-2">
      <select
        className="w-full rounded-lg border border-[#d8ddda] px-3 py-2.5 text-sm text-[#14181a] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        value={largeCategory}
        onChange={(e) => setLargeCategory(e.target.value)}
      >
        <option value="">업종을 선택해주세요</option>
        {groups.map((g) => (
          <option key={g.largeCategory} value={g.largeCategory}>
            {g.largeCategory}
          </option>
        ))}
      </select>

      {currentGroup && (
        <div className="border border-[#e2e6e3] rounded-lg p-2.5 max-h-[180px] overflow-y-auto flex flex-wrap gap-1.5">
          {currentGroup.industries.map((i) => {
            const selected = i.industryCode === selectedCode
            return (
              <button
                type="button"
                key={i.industryCode}
                onClick={() => onSelect(i)}
                className={`px-3 py-1.5 rounded-full text-[13px] border transition-colors ${
                  selected
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-[#4b5450] border-[#d8ddda] hover:border-brand-400'
                }`}
              >
                {i.industryName}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
