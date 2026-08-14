import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import Button from './ui/Button'
import { useApp } from '../context/AppContext'
import { getAnalysisMeta } from '../lib/localMeta'

export default function AppShell({ children, crumb }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { analyses, listAllQuestionnaires } = useApp()
  const [questionnaireCount, setQuestionnaireCount] = useState(0)
  const isActive = (prefix) => location.pathname === prefix || location.pathname.startsWith(prefix + '/')

  useEffect(() => {
    listAllQuestionnaires().then((list) => setQuestionnaireCount(list.length))
  }, [listAllQuestionnaires, location.pathname])

  const paidCompleted = analyses.filter((a) => a.status === 'COMPLETED' && getAnalysisMeta(a.analysisId)?.paid)

  return (
    <div className="min-h-screen bg-[#f4f6f5]">
      <header className="sticky top-0 z-10 bg-white border-b border-[#e2e6e3]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-2 text-sm text-[#8a938e]">
            <Link to="/home">
              <Logo />
            </Link>
            {crumb && (
              <>
                <span>/</span>
                <span className="text-[#14181a] font-medium">{crumb}</span>
              </>
            )}
          </div>
          <Button variant="secondary" onClick={() => navigate('/home')}>
            내 아이템
          </Button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto flex">
        <aside className="hidden md:block w-[248px] shrink-0 px-6 py-6">
          <Button className="w-full mb-6" onClick={() => navigate('/')}>
            + 새 아이템 진단
          </Button>

          <p className="text-[11px] font-medium text-[#9aa39e] mb-2 px-1">진단</p>
          <nav className="flex flex-col gap-0.5 mb-6">
            <Link
              to="/home"
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                isActive('/home') ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-[#4b5450] hover:bg-[#eef1ef]'
              }`}
            >
              내 아이템
              <span className="text-[11px] text-[#9aa39e]">{analyses.length}</span>
            </Link>
            <Link
              to="/compare"
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                isActive('/compare') ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-[#4b5450] hover:bg-[#eef1ef]'
              }`}
            >
              아이템 비교
              <span className="text-[10px] border border-[#e2e6e3] rounded px-1.5 py-0.5 text-[#9aa39e]">BETA</span>
            </Link>
          </nav>

          <p className="text-[11px] font-medium text-[#9aa39e] mb-2 px-1">설문</p>
          <nav className="flex flex-col gap-0.5 mb-6">
            <Link
              to="/questionnaires"
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                isActive('/questionnaires') ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-[#4b5450] hover:bg-[#eef1ef]'
              }`}
            >
              설문지
              <span className="text-[11px] text-[#9aa39e]">{questionnaireCount}</span>
            </Link>
          </nav>

          <p className="text-[11px] font-medium text-[#9aa39e] mb-2 px-1">자료</p>
          <nav className="flex flex-col gap-0.5">
            <Link
              to="/reports"
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                isActive('/reports') ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-[#4b5450] hover:bg-[#eef1ef]'
              }`}
            >
              리포트
              <span className="text-[11px] text-[#9aa39e]">{paidCompleted.length}</span>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 px-5 sm:px-8 py-8 min-w-0">{children}</main>
      </div>
    </div>
  )
}
