const BASE = '/api'

function getToken() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return user?.token ?? null
  } catch {
    return null
  }
}

function autoLogout() {
  localStorage.removeItem('user')
  localStorage.removeItem('moh_cart')
  localStorage.removeItem('moh_favorites')
  window.dispatchEvent(new Event('moh:logout'))
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  // Истёкший / невалидный токен → разлогиниваем
  if ((res.status === 401 || res.status === 403) && token && !path.includes('/auth/')) {
    autoLogout()
    return null
  }

  if (!res.ok) {
    const text = await res.text()
    let msg = text
    try { msg = JSON.parse(text)?.error || text } catch {}
    throw new Error(msg || `Ошибка ${res.status}`)
  }
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : null
}

export const api = {
  get:    (path)         => request(path),
  post:   (path, body)   => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)   => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path)         => request(path, { method: 'DELETE' }),
  upload: (path, formData) => {
    const token = getToken()
    return fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(res => res.json())
  },
}
