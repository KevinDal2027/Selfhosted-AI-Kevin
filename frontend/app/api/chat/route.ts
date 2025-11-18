import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // AI features disabled - return message directly
  return NextResponse.json({
    success: true,
    answer: "I'm disabling this AI features because my laptop server is actually burning because there are so many requests lol.",
    model: 'kevin'
  })
  
  // try {
  //   const body = await request.json()
  //   
  //   const headers: Record<string, string> = {
  //     'Content-Type': 'application/json'
  //   }
  //   if (process.env.API_KEY) headers['X-API-Key'] = process.env.API_KEY
  //   
  //   const backendResponse = await fetch('http://ai-backend:3001/api/chat', {
  //     method: 'POST',
  //     headers,
  //     body: JSON.stringify(body)
  //   })

  //   if (!backendResponse.ok) {
  //     throw new Error(`Backend error: ${backendResponse.status}`)
  //   }

  //   const data = await backendResponse.json()
  //   return NextResponse.json(data)
  // } catch (error) {
  //   console.error('API proxy error:', error)
  //   return NextResponse.json(
  //     { error: 'AI service is currently unavailable. Please try again later.' },
  //     { status: 500 }
  //   )
  // }
}