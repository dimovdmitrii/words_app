import { useCallback, useState, useEffect, useRef } from 'react'
import { MenuButton } from './Menu'

/** Android WebView often has no speechSynthesis; bare `speechSynthesis` throws ReferenceError. */
function getSpeechSynthesis(): SpeechSynthesis | undefined {
  return (globalThis as unknown as { speechSynthesis?: SpeechSynthesis }).speechSynthesis
}

function cancelSpeechSynthesisSafe() {
  getSpeechSynthesis()?.cancel()
}

function speakWithTTS(text: string) {
  const ss = getSpeechSynthesis()
  if (!ss) return
  ss.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'de-DE'
  utterance.rate = 0.9
  ss.speak(utterance)
}

function buildLocalSoundPath(word: string): string {
  return `/sounds/${encodeURIComponent(word.trim())}.mp3`
}

function buildGoogleTtsUrl(word: string): string {
  const text = encodeURIComponent(word.trim())
  // tw-ob endpoint is commonly used by gTTS-compatible playback.
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${text}&tl=de&client=tw-ob`
}

interface QuestionCardProps {
  german: string
  options: string[]
  correctAnswer: string
  onAnswer: (answer: string) => void
  onMenuClick: () => void
  isReview?: boolean
}

export function QuestionCard({
  german,
  options,
  correctAnswer,
  onAnswer,
  onMenuClick,
  isReview = false
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioEnabledRef = useRef(audioEnabled)
  
  useEffect(() => {
    audioEnabledRef.current = audioEnabled
  }, [audioEnabled])

  const playSound = useCallback((word: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    cancelSpeechSynthesisSafe()

    const localAudioPath = buildLocalSoundPath(word)
    const audio = new Audio(localAudioPath)
    audioRef.current = audio
    
    audio.play().catch(() => {
      // Fallback for newly added/generated words without local mp3 file.
      const webTtsAudio = new Audio(buildGoogleTtsUrl(word))
      audioRef.current = webTtsAudio
      webTtsAudio.play().catch(() => {
        speakWithTTS(word)
      })
    })
    
    audio.onerror = () => {
      const webTtsAudio = new Audio(buildGoogleTtsUrl(word))
      audioRef.current = webTtsAudio
      webTtsAudio.play().catch(() => {
        speakWithTTS(word)
      })
    }
  }, [])

  const handleWordClick = useCallback(() => {
    playSound(german)
  }, [german, playSound])

  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => !prev)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    cancelSpeechSynthesisSafe()
  }, [])

  useEffect(() => {
    if (audioEnabledRef.current) {
      playSound(german)
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      cancelSpeechSynthesisSafe()
    }
  }, [german, playSound])

  const handleClick = useCallback(
    (option: string) => () => {
      if (selectedOption) return // Prevent double-click during animation
      
      const correct = option === correctAnswer
      setSelectedOption(option)
      setIsCorrect(correct)

      // After animation, call onAnswer
      setTimeout(() => {
        setSelectedOption(null)
        setIsCorrect(null)
        onAnswer(option)
      }, 400)
    },
    [correctAnswer, onAnswer, selectedOption]
  )

  return (
    <section className="card" role="main" aria-label="Vocabulary question">
      <div className="card-header">
        <p className="card-label">{isReview ? 'Review' : 'Learn'}</p>
        <MenuButton onClick={onMenuClick} />
      </div>
      <div className="card-word-row">
        <h2 className="card-word clickable" onClick={handleWordClick}>{german}</h2>
        <button 
          className={`speak-btn ${!audioEnabled ? 'muted' : ''}`} 
          onClick={toggleAudio} 
          aria-label={audioEnabled ? 'Mute audio' : 'Unmute audio'}
        >
          {audioEnabled ? '🔊' : '🔇'}
        </button>
      </div>
      <p className="card-hint">
        {options.length < 5
          ? `${options.length} options left`
          : 'Choose the correct translation'}
      </p>
      <div className="options">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`option-btn ${
              selectedOption === opt
                ? isCorrect
                  ? 'correct'
                  : 'wrong'
                : ''
            }`}
            onClick={handleClick(opt)}
            disabled={selectedOption !== null}
          >
            {opt}
          </button>
        ))}
      </div>
    </section>
  )
}
