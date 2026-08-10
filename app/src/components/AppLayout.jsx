import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { label: '홈', to: '/home', match: '/home' },
  { label: '새 분석', to: '/analyze/new', match: '/analyze/new' },
  { label: '설정', to: '/settings', match: '/settings' },
]

export default function AppLayout({ children }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="sticky top-0 z-10 bg-white border-b border-[#d0d0d0]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 h-14">
          <Link to="/home" className="text-[16px] font-semibold text-[#333]">
            시장검증
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 border border-[#d0d0d0] rounded-md px-3 py-1.5 text-sm text-[#999]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span>검색</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#f5f5f5] border border-[#d0d0d0] flex items-center justify-center text-[12px] text-[#666]">
              사용
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto flex">
        <aside className="hidden md:block w-[220px] shrink-0 border-r border-[#d0d0d0] bg-[#f5f5f5] min-h-[calc(100vh-56px)] px-4 py-6">
          <p className="text-[11px] text-[#999] mb-3 px-2">메뉴</p>
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname.startsWith(item.match)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-2 py-2 rounded-md text-sm ${
                    active ? 'font-bold text-[#333]' : 'text-[#666] underline'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 px-5 sm:px-8 py-8 min-w-0">{children}</main>
      </div>
    </div>
  )
}
