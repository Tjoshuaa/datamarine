export function isAdminAuthenticated() {
  if (typeof window === 'undefined') return false

  return localStorage.getItem('admin_auth') === 'true'
}

export async function loginAdmin(password: string) {
  const ADMIN_PASSWORD = '1234'

  if (password !== ADMIN_PASSWORD) {
    return false
  }

  localStorage.setItem('admin_auth', 'true')

  // Create server-side admin session
  try {
    const response = await fetch(
      '/api/admin/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      localStorage.removeItem('admin_auth')
      return false
    }

    return true
  } catch (error) {
    console.error(
      'Admin login error:',
      error
    )

    localStorage.removeItem('admin_auth')
    return false
  }
}

export async function logoutAdmin() {
  localStorage.removeItem('admin_auth')

  try {
    await fetch(
      '/api/admin/logout',
      {
        method: 'POST',
      }
    )
  } catch (error) {
    console.error(
      'Admin logout error:',
      error
    )
  }
}
