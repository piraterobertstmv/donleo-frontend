"use client"

import { useState } from "react"
import { Message } from "@/types"
import { Locale } from "@/i18n/request"
import { getResponses } from "@/lib/responses"

export function useMockChat(locale: Locale = 'en') {
  const responses = getResponses(locale)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "leo",
      content: responses.greetings[0],
      timestamp: new Date(Date.now() - 60000 * 5),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const sendMessage = async (content: string, images?: File[]) => {
    const imageUrls = images?.map((f) => URL.createObjectURL(f)) ?? []

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      images: imageUrls.length > 0 ? imageUrls : undefined,
    }
    setMessages((prev) => [...prev, userMessage])

    setIsLoading(true)
    try {
      const chatHistory = messages.map(m => {
        const role: "user" | "assistant" = m.role === "leo" ? "assistant" : "user"
        return { role, content: m.content }
      })

      const base64Images = images?.length
        ? await Promise.all(images.map(fileToBase64))
        : undefined

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          chatHistory,
          userMessage: content,
          images: base64Images,
        }),
      })

      if (!response.ok) {
        throw new Error("Chat API request failed")
      }

      const data = await response.json()

      const leoMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "leo",
        content: data.response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, leoMessage])
    } catch (error) {
      console.error("Chat error:", error)

      // Fallback to mock response on error
      const leoMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "leo",
        content: "Hey! I'm having some trouble connecting right now. Try again in a moment?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, leoMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return { messages, sendMessage, isLoading }
}
