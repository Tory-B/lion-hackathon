import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import Button from '../components/ui/Button'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f4f6f5] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="flex justify-center mb-5">
          <Logo />
        </div>
        <p className="text-[15px] font-semibold text-[#14181a] mb-1">페이지를 찾을 수 없습니다</p>
        <p className="text-[13px] text-[#6b7570] mb-6">주소가 잘못되었거나 삭제된 페이지입니다.</p>
        <Button onClick={() => navigate('/home')}>내 아이템으로 이동</Button>
      </div>
    </div>
  )
}
