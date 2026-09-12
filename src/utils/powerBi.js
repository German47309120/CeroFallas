const allowedPath = (pathname) => pathname === '/view'
  || pathname === '/reportEmbed'
  || /^\/groups\/[^/]+\/reports\/[^/]+/.test(pathname)

export function powerBiReportConfiguration(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return { state: 'unconfigured', url: null, accessMode: null }
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:' || url.hostname !== 'app.powerbi.com' || !allowedPath(url.pathname)) {
      return { state: 'invalid', url: null, accessMode: null }
    }
    return {
      state: 'ready',
      url: url.toString(),
      accessMode: url.pathname === '/view' ? 'public_link' : 'authenticated',
    }
  } catch {
    return { state: 'invalid', url: null, accessMode: null }
  }
}
