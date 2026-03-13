import { useState } from 'react'

interface AddWordFormProps {
  onAdd: (german: string, russian: string) => string | null
  onClose: () => void
}

export function AddWordForm({ onAdd, onClose }: AddWordFormProps) {
  const [german, setGerman] = useState('')
  const [russian, setRussian] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedGerman = german.trim()
    const trimmedRussian = russian.trim()
    
    if (!trimmedGerman || !trimmedRussian) {
      setError('Fill in both fields')
      return
    }
    
    const addError = onAdd(trimmedGerman, trimmedRussian)
    if (addError) {
      setError(addError)
      return
    }
    
    setGerman('')
    setRussian('')
    setError(null)
    onClose()
  }

  return (
    <div className="menu-overlay" onClick={onClose}>
      <div className="menu-screen add-word-form" onClick={(e) => e.stopPropagation()}>
        <button className="menu-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 className="menu-title">Add Word</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="german">German</label>
            <input
              id="german"
              type="text"
              value={german}
              onChange={(e) => setGerman(e.target.value)}
              placeholder="der Tisch, gehen, schnell..."
              autoComplete="off"
              autoFocus
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="russian">Russian</label>
            <input
              id="russian"
              type="text"
              value={russian}
              onChange={(e) => setRussian(e.target.value)}
              placeholder="перевод"
              autoComplete="off"
            />
          </div>
          
          {error && <p className="form-error">{error}</p>}
          
          <div className="menu-buttons">
            <button type="submit" className="menu-btn primary">
              Add to pool
            </button>
            <button type="button" className="menu-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
