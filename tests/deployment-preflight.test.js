import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { inspectBuildChunks, inspectBuildHtml, inspectCloudEnvironment, parseEnvironment, runPreflight } from '../scripts/preflight-deployment.mjs'

describe('preflight de publicación', () => {
  it('interpreta variables sin exponer sus valores en los resultados', () => {
    const secretLikeValue = 'valor-que-no-debe-imprimirse'
    const parsed = parseEnvironment(`VITE_FIREBASE_API_KEY=${secretLikeValue}\nVITE_DEMO_MODE=false`)
    expect(parsed.VITE_FIREBASE_API_KEY).toBe(secretLikeValue)
    expect(JSON.stringify(inspectCloudEnvironment('', false))).not.toContain(secretLikeValue)
  })

  it('bloquea un ambiente ausente o configurado como emulador/demo', () => {
    expect(inspectCloudEnvironment('', false)[0].level).toBe('BLOCK')
    const results = inspectCloudEnvironment('VITE_USE_FIREBASE_EMULATORS=true\nVITE_DEMO_MODE=true', true)
    expect(results.filter((item) => item.level === 'BLOCK')).toHaveLength(3)
  })

  it('reconoce una configuración cloud completa sin imprimir valores', () => {
    const lines = [
      'VITE_FIREBASE_API_KEY=demo-public-key', 'VITE_FIREBASE_AUTH_DOMAIN=demo.example',
      'VITE_FIREBASE_PROJECT_ID=demo', 'VITE_FIREBASE_STORAGE_BUCKET=demo.example',
      'VITE_FIREBASE_MESSAGING_SENDER_ID=123', 'VITE_FIREBASE_APP_ID=app-123',
      'VITE_USE_FIREBASE_EMULATORS=false', 'VITE_DEMO_MODE=false',
    ].join('\n')
    const results = inspectCloudEnvironment(lines, true)
    expect(results.every((item) => item.level === 'PASS')).toBe(true)
    expect(JSON.stringify(results)).not.toContain('demo-public-key')
  })

  it('bloquea paquetes JavaScript mayores de 500 kB', () => {
    const assets = mkdtempSync(join(tmpdir(), 'cerofallas-assets-'))
    writeFileSync(join(assets, 'small.js'), Buffer.alloc(499 * 1024))
    expect(inspectBuildChunks(assets).level).toBe('PASS')
    writeFileSync(join(assets, 'large.js'), Buffer.alloc(501 * 1024))
    expect(inspectBuildChunks(assets).level).toBe('BLOCK')
  })

  it('impide publicar herramientas temporales de diseño o referencias locales', () => {
    expect(inspectBuildHtml('<script src="https://mcp.figma.com/mcp/html-to-design/capture.js"></script>').level).toBe('BLOCK')
    expect(inspectBuildHtml('<a href="http://127.0.0.1:5173">Local</a>').level).toBe('BLOCK')
    expect(inspectBuildHtml('<div id="root"></div><script src="/assets/app.js"></script>').level).toBe('PASS')
  })

  it('reporta el repositorio local sin ejecutar un despliegue', () => {
    const results = runPreflight()
    expect(results.some((item) => item.message.includes('navegación SPA') && item.level === 'PASS')).toBe(true)
    expect(results.some((item) => item.message.includes('cuatro encabezados') && item.level === 'PASS')).toBe(true)
    expect(results.some((item) => item.message.includes('paquete JavaScript mayor') && item.level === 'PASS')).toBe(true)
    expect(results.some((item) => item.message.includes('HTML de producción') && item.level === 'PASS')).toBe(true)
    expect(results.some((item) => item.message.includes('Git no rastrea') && item.level === 'PASS')).toBe(true)
    expect(results.some((item) => item.message.includes('alias Firebase') && item.level === 'PASS')).toBe(true)
  })
})
