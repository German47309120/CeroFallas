const allowedPath = (pathname) => pathname === '/view'
  || pathname === '/reportEmbed'
  || /^\/groups\/[^/]+\/reports\/[^/]+/.test(pathname)

function embedUrlFor(url) {
  if (url.pathname === '/view' || url.pathname === '/reportEmbed') return url.toString()
  const match = url.pathname.match(/^\/groups\/([^/]+)\/reports\/([^/]+)/)
  if (!match) return url.toString()
  const [, groupId, reportId] = match
  const embedUrl = new URL('/reportEmbed', url.origin)
  embedUrl.searchParams.set('reportId', reportId)
  if (groupId !== 'me') embedUrl.searchParams.set('groupId', groupId)
  embedUrl.searchParams.set('autoAuth', 'true')
  return embedUrl.toString()
}

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
      embedUrl: embedUrlFor(url),
      accessMode: url.pathname === '/view' ? 'public_link' : 'authenticated',
    }
  } catch {
    return { state: 'invalid', url: null, accessMode: null }
  }
}
