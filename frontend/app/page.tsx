"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, Moon, Sun } from "lucide-react"
import { ParticleBackground } from "@/components/particle-background"
import { useTheme } from "@/components/theme-provider"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isTyping?: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [introVisible, setIntroVisible] = useState(true)
  const [hintShown, setHintShown] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [typingMessage, setTypingMessage] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  
  const chatSuggestions = [
    "Who are you?",
    "Tell me about your projects",
    "What are your hobbies?",
    "What technologies do you use?",
    "Tell me about your work experience",
    "What are you studying?"
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  const typeMessage = (fullMessage: string, messageId: string) => {
    let currentText = ""
    let index = 0
    
    const typeNextChar = () => {
      if (index < fullMessage.length) {
        currentText += fullMessage[index]
        setTypingMessage({
          id: messageId,
          role: "assistant",
          content: currentText,
          isTyping: true
        })
        index++
        setTimeout(typeNextChar, 30) // 30ms between characters for fast typing
      } else {
        // Finished typing, add to messages and clear typing message
        setMessages(prev => [...prev, {
          id: messageId,
          role: "assistant",
          content: fullMessage
        }])
        setTypingMessage(null)
      }
    }
    
    typeNextChar()
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)
    if (introVisible) setIntroVisible(false)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      })

      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      const messageId = (Date.now() + 1).toString()
      
      // Start typing animation
      typeMessage(data?.answer ?? "Sorry, I couldn't generate a response.", messageId)
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "The AI service is unavailable right now. Please try again shortly.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoading) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: suggestion,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    if (introVisible) setIntroVisible(false)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: suggestion }),
      })

      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      const messageId = (Date.now() + 1).toString()
      
      // Start typing animation
      typeMessage(data?.answer ?? "Sorry, I couldn't generate a response.", messageId)
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "The AI service is unavailable right now. Please try again shortly.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <ParticleBackground />

      {/* Intro overlay */}
      {introVisible && messages.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <h1 className="px-6 text-center text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">
            Hi, I'm Kevin!
          </h1>
        </div>
      )}

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <h1 className="text-2xl font-bold text-foreground">Chat with Kevin</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {mounted ? (
                theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
              ) : (
                <span className="inline-block h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </header>

        {/* Chat Messages */}
        <main className="container mx-auto flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {/* Chat suggestions (show when no messages) */}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {chatSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <Card
                  className={`max-w-[80%] p-4 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </Card>
              </div>
            ))}
            
            {/* Show typing message */}
            {typingMessage && (
              <div className="flex justify-start">
                <Card className="max-w-[80%] bg-card p-4 text-card-foreground">
                  <p className="text-sm leading-relaxed">
                    {typingMessage.content}
                    <span className="inline-block w-2 h-5 bg-foreground ml-1 animate-pulse">|</span>
                  </p>
                </Card>
              </div>
            )}
            
            {/* Show thinking message */}
            {isLoading && (
              <div className="flex justify-start">
                <Card className="max-w-[80%] bg-card p-4 text-card-foreground">
                  <p className="text-sm text-muted-foreground italic">
                    Kevin is thinking...
                  </p>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Form */}
        <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl gap-2">
              <Input
                value={input}
                onChange={(e) => {
                  const v = e.target.value
                  setInput(v)
                  if (v.trim().length > 0) {
                    if (introVisible) setIntroVisible(false)
                    if (!hintShown) {
                      setMessages((prev) => {
                        if (prev.length === 0) {
                          return [
                            ...prev,
                            {
                              id: "hint-1",
                              role: "assistant",
                              content: "Hi! I'm Kevin's AI assistant. You can ask me about my technical skills, projects, work experience, or anything else you'd like to know!",
                            },
                          ]
                        }
                        return prev
                      })
                      setHintShown(true)
                    }
                  }
                }}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </div>
        </footer>
      </div>
    </div>
  )
}
