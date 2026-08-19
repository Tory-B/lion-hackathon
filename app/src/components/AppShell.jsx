import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import Button from './ui/Button'
import { useApp } from '../context/AppContext'
import { getAnalysisMeta } from '../lib/localMeta'

function SidebarNav({ counts, isActive, onNavigate, onNewAnalysis }) {
  return (
    <>
      <Button className="w-full mb-6" onClick={onNewAnalysis}>
        + 새 아이템 진단
      </Button>

      <p className="text-[11px] font-medium text-[#9aa39e] mb-2 px-1">진단</p>
      <nav className="flex flex-col gap-0.5 mb-6">
        <Link
          to="/home"
          onClick={onNavigate}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
            isActive('/home') ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-[#4b5450] hover:bg-[#eef1ef]'
          }`}
        >
          내 아이템
          <span className="text-[11px] text-[#9aa39e]">{counts.analyses}</span>
        </Link>
        <Link
          to="/compare"
          onClick={onNavigate}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
            isActive('/compare') ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-[#4b5450] hover:bg-[#eef1ef]'
          }`}
        >
          아이템 비교
        </Link>
      </nav>

      <p className="text-[11px] font-medium text-[#9aa39e] mb-2 px-1">설문</p>
      <nav className="flex flex-col gap-0.5 mb-6">
        <Link
          to="/questionnaires"
          onClick={onNavigate}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
            isActive('/questionnaires') ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-[#4b5450] hover:bg-[#eef1ef]'
          }`}
        >
          설문지
          <span className="text-[11px] text-[#9aa39e]">{counts.questionnaires}</span>
        </Link>
      </nav>

      <p className="text-[11px] font-medium text-[#9aa39e] mb-2 px-1">자료</p>
      <nav className="flex flex-col gap-0.5">
        <Link
          to="/reports"
          onClick={onNavigate}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
            isActive('/reports') ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-[#4b5450] hover:bg-[#eef1ef]'
          }`}
        >
          리포트
          <span className="text-[11px] text-[#9aa39e]">{counts.reports}</span>
        </Link>
      </nav>
    </>
  )
}

export default function AppShell({ children, crumb }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { analyses, listAllQuestionnaires } = useApp()
  const [questionnaireCount, setQuestionnaireCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const isActive = (prefix) => location.pathname === prefix || location.pathname.startsWith(prefix + '/')

  useEffect(() => {
    listAllQuestionnaires().then((list) => setQuestionnaireCount(list.length))
  }, [listAllQuestionnaires, location.pathname])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const paidCompletedCount = analyses.filter(
    (a) => a.status === 'COMPLETED' && getAnalysisMeta(a.analysisId)?.paid,
  ).length

  const counts = { analyses: analyses.length, questionnaires: questionnaireCount, reports: paidCompletedCount }

  return (
    <div className="min-h-screen bg-[#f4f6f5]">
      <header className="sticky top-0 z-10 bg-white border-b border-[#e2e6e3]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="메뉴 열기"
              className="md:hidden -ml-1 mr-1 p-2 text-[#4b5450]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex items-center gap-2 text-sm text-[#8a938e] min-w-0">
              <Link to="/" className="shrink-0">
                <Logo />
              </Link>
              {crumb && (
                <>
                  <span className="shrink-0">/</span>
                  <span className="text-[#14181a] font-medium truncate">{crumb}</span>
                </>
              )}
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate('/home')} className="shrink-0">
            내 아이템
          </Button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-20 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[260px] bg-white px-6 py-6 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <Logo />
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기" className="text-[#9aa39e] text-xl leading-none p-1">
                ×
              </button>
            </div>
            <SidebarNav
              counts={counts}
              isActive={isActive}
              onNavigate={() => setMenuOpen(false)}
              onNewAnalysis={() => {
                setMenuOpen(false)
                navigate('/')
              }}
            />
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto flex">
        <aside className="hidden md:block w-[248px] shrink-0 px-6 py-6">
          <SidebarNav counts={counts} isActive={isActive} onNavigate={() => {}} onNewAnalysis={() => navigate('/')} />
        </aside>

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 min-w-0">{children}</main>
      </div>
    </div>
  )
}
