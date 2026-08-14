// 로그인 없는 익명 세션 식별자 (X-Session-Id 헤더 목업, localStorage에 보관)
const KEY = 'suyo_session_id'

export function getSessionId() {
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}
