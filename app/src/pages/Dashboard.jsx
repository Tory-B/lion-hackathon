import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'

const STATUS_LABEL = {
  done: '분석 완료',
  processing: '분석 중 · 요청 접수 완료',
  error: '분석 오류 · 재시도 필요',
}

export default function Dashboard() {
  const { analyses } = useApp()
  const navigate = useNavigate()

  return (
    <AppLayout>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <h1 className="text-[20px] font-bold text-[#171719]">내 아이템 분석</h1>
        <Button onClick={() => navigate('/analyze/new')}>새 분석 시작</Button>
      </div>
      <p className="text-[11px] text-[#999] mb-6 leading-relaxed">
        데이터 기준 시점 및 신뢰 한계 안내: 모든 진단 근거는 공개 출처 기반이며, 수집 기준
        시점이 상이할 수 있습니다. 수요 레이어는 확정된 수요가 아니라 검증 수준과 미검증
        가설로 표현됩니다.
      </p>

      {analyses.length === 0 ? (
        <Card className="text-center py-14">
          <p className="font-semibold text-[#333] mb-2">분석 아이템이 없습니다</p>
          <p className="text-[13px] text-[#666] mb-5">
            새 분석을 시작하면 이 목록에서 처리 상태와 결과를 확인할 수 있습니다.
          </p>
          <Button onClick={() => navigate('/analyze/new')}>새 분석 시작</Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {analyses.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="font-semibold text-[#333]">{a.itemName}</p>
                  <p className="text-[12px] text-[#999] mt-0.5">
                    {STATUS_LABEL[a.status]} · {a.createdAt} 기준
                  </p>
                </div>
                {a.status === 'done' && (
                  <div className="text-right">
                    <p className="text-[11px] text-[#999]">종합 리스크 점수</p>
                    <p className="text-[18px] font-bold text-[#171719]">
                      {a.diagnosis.compositeScore}점
                    </p>
                    <Link
                      to={`/analyze/${a.id}/result`}
                      className="text-[13px] text-[#666] underline"
                    >
                      결과 보기
                    </Link>
                  </div>
                )}
                {a.status === 'processing' && (
                  <Link
                    to={`/analyze/${a.id}/progress`}
                    className="text-[13px] text-[#666] underline"
                  >
                    분석 진행 중
                  </Link>
                )}
                {a.status === 'error' && (
                  <Button variant="secondary" onClick={() => navigate('/analyze/new')}>
                    재시도
                  </Button>
                )}
              </div>

              {a.status === 'done' && (
                <>
                  <div className="grid sm:grid-cols-4 gap-3 mt-4">
                    {Object.values(a.diagnosis.layers).map((layer) => (
                      <div
                        key={layer.key}
                        className="border border-[#eee] rounded-md px-3 py-2.5"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[12px] font-medium text-[#333]">{layer.label}</p>
                          <Badge>
                            {layer.key === 'demand' ? layer.verificationLabel : layer.level.label}
                          </Badge>
                        </div>
                        <p className="text-[12px] text-[#777] leading-snug line-clamp-2">
                          {layer.factors[0]?.title}
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="text-[13px] font-medium text-[#333] mt-4 mb-2">
                    미검증 가설 및 우선 검증 행동
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {a.diagnosis.hypotheses
                      .filter((h) => h.status === 'unverified')
                      .slice(0, 2)
                      .map((h) => (
                        <div key={h.id} className="border border-[#eee] rounded-md px-3 py-2.5">
                          <p className="text-[12px] text-[#333] leading-snug mb-2">{h.title}</p>
                          <Button
                            variant="secondary"
                            className="text-[12px] py-1.5 px-3"
                            onClick={() => navigate(`/analyze/${a.id}/hypotheses`)}
                          >
                            검증 질문지 생성
                          </Button>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
