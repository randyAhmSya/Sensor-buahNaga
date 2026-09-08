export const sanitizeInput = (value: string): string => {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<[^>]*>?/gm, '') // Hapus tag HTML (<script>, <iframe>, <img>, dll.)
    .replace(/javascript:/gi, '') // Cegah URI scheme berbahaya
    .replace(/[<>"'/`]/g, (match) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
      }
      return entities[match] || match
    })
    .trim()
}

export const sanitizeObject = <T extends Record<string, unknown>>(data: T): T => {
  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === 'string') {
      result[key] = sanitizeInput(val)
    } else {
      result[key] = val
    }
  }
  return result as T
}
