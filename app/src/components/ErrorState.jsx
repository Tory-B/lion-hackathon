import { useNavigate } from 'react-router-dom'
import Card from './ui/Card'
import Button from './ui/Button'

const MESSAGE_BY_CODE = {
  NOT_FOUND: '해당 아이템을 찾을 수 없습니다.',
  ANALYSIS_NOT_COMPLETED: '진단이 아직 끝나지 않았습니다.',
  PAYMENT_REQUIRED: '결제가 필요한 화면입니다.',
}

export default function ErrorState({ error, backTo = '/home', backLabel = '내 아이템으로 돌아가기' }) {
  const navigate = useNavigate()
  const message = MESSAGE_BY_CODE[error?.code] || error?.message || '문제가 발생했습니다.'

  return (
    <Card className="text-center py-14">
      <p className="font-semibold text-[#14181a] mb-2">{message}</p>
      <p className="text-[13px] text-[#6b7570] mb-5">
        삭제되었거나 존재하지 않는 아이템일 수 있습니다. 새로고침해도 계속 이 화면이 뜨면 처음부터
        다시 시도해 주세요.
      </p>
      <Button onClick={() => navigate(backTo)}>{backLabel}</Button>
    </Card>
  )
}
