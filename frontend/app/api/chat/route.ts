import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // This works because it's server-side (inside Docker network)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (process.env.API_KEY) headers['X-API-Key'] = process.env.API_KEY
    const backendResponse = await fetch('http://ai-backend:3001/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body)
    })

    if (!backendResponse.ok) {
      throw new Error(`Backend error: ${backendResponse.status}`)
    }

    const data = await backendResponse.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('API proxy error:', error)
    res.status(500).json({ 
      error: 'AI service is currently unavailable. Please try again later.' 
    })
  }
}
