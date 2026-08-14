// GET /api/industries 목업 — 서울 매출데이터와 매핑된 업종만 그룹핑해 반환 (실제 96개 중 데모용 일부)
export const INDUSTRY_GROUPS = [
  {
    largeCategory: '음식',
    industries: [
      { industryCode: 'G30101', industryName: '카페', midCategory: '비알코올' },
      { industryCode: 'G30201', industryName: '백반/한정식', midCategory: '한식' },
      { industryCode: 'G30301', industryName: '치킨전문점', midCategory: '육류' },
      { industryCode: 'G30401', industryName: '분식점', midCategory: '분식' },
      { industryCode: 'G30501', industryName: '베이커리', midCategory: '제과' },
      { industryCode: 'G30601', industryName: '동네술집', midCategory: '주점' },
    ],
  },
  {
    largeCategory: '소매',
    industries: [
      { industryCode: 'G21001', industryName: '편의점', midCategory: '종합 소매' },
      { industryCode: 'G22001', industryName: '반려동물용품', midCategory: '전문 소매' },
      { industryCode: 'G22101', industryName: '꽃집', midCategory: '전문 소매' },
      { industryCode: 'G22201', industryName: '문구점', midCategory: '전문 소매' },
      { industryCode: 'G22301', industryName: '무인 세탁소', midCategory: '생활 서비스' },
    ],
  },
  {
    largeCategory: '생활서비스',
    industries: [
      { industryCode: 'G41001', industryName: '미용실', midCategory: '이미용' },
      { industryCode: 'G41101', industryName: '네일샵', midCategory: '이미용' },
      { industryCode: 'G41201', industryName: '필라테스/요가', midCategory: '스포츠' },
      { industryCode: 'G41301', industryName: '헬스장', midCategory: '스포츠' },
      { industryCode: 'G41401', industryName: '보습학원', midCategory: '교육' },
    ],
  },
  {
    largeCategory: '반려동물',
    industries: [
      { industryCode: 'G51001', industryName: '반려동물 미용', midCategory: '펫케어' },
      { industryCode: 'G51101', industryName: '반려동물 셀프목욕', midCategory: '펫케어' },
    ],
  },
]

export const ALL_INDUSTRIES = INDUSTRY_GROUPS.flatMap((g) =>
  g.industries.map((i) => ({ ...i, largeCategory: g.largeCategory })),
)

export function findIndustry(code) {
  return ALL_INDUSTRIES.find((i) => i.industryCode === code)
}
