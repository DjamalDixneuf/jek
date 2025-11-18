// netlify/functions/proxy.js
export default async function handler(req, res) {
  const url = req.query.url
  if (!url) return res.status(400).send('Missing url')

  try {
    const response = await fetch(url)
    const data = await response.text()

    res.setHeader('Content-Type', 'text/html')
    res.setHeader('X-Frame-Options', 'ALLOWALL') // Autorise l'iframe
    res.setHeader('Content-Security-Policy', "frame-ancestors *")
    res.send(data)
  } catch (err) {
    res.status(500).send('Proxy error')
  }
}

export const config = { path: "/proxy" }
