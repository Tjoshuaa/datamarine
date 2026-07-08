export function isAdminAuthenticated() {
  if (typeof window === 'undefined') return false

  return localStorage.getItem('admin_auth') === 'true'
}

export function loginAdmin(password: string) {
  // simple password (you can change later)
  const ADMIN_PASSWORD = '1234'

  if (password === ADMIN_PASSWORD) {
    localStorage.setItem('admin_auth', 'true')
    return true
  }

  return false
}

export function logoutAdmin() {
  localStorage.removeItem('admin_auth')
}