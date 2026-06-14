import { useState, useEffect } from 'react'

export function useTypewriter(text: string, speed: number = 18, enabled: boolean = true) {
  const [displayText, setDisplayText] = useState('')
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setDisplayText(text)
      setIsDone(true)
      return
    }
    setDisplayText('')
    setIsDone(false)
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1))
        i++
      } else {
        setIsDone(true)
        clearInterval(timer)
      }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed, enabled])

  return { displayText, isDone }
}

export function useCyclingTypewriter(phrases: string[], typingSpeed = 60, pauseMs = 2000) {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = phrases[phraseIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), typingSpeed)
    } else if (!deleting && displayed.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), pauseMs)
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), typingSpeed / 2)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setPhraseIndex((i) => (i + 1) % phrases.length)
    }

    return () => clearTimeout(timeout)
  }, [displayed, deleting, phraseIndex, phrases, typingSpeed, pauseMs])

  return displayed
}
