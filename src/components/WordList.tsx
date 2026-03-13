import { useState } from 'react'
import type { VocabEntry } from '../types'

interface WordListProps {
  baseWords: VocabEntry[]
  customWords: VocabEntry[]
  deletedBaseIds: string[]
  onDeleteBase: (id: string) => void
  onDeleteCustom: (id: string) => void
  onRestoreBase: (id: string) => void
  onClose: () => void
}

type Tab = 'active' | 'custom' | 'deleted'

export function WordList({
  baseWords,
  customWords,
  deletedBaseIds,
  onDeleteBase,
  onDeleteCustom,
  onRestoreBase,
  onClose
}: WordListProps) {
  const [tab, setTab] = useState<Tab>('active')
  const [search, setSearch] = useState('')

  const deletedBaseSet = new Set(deletedBaseIds)
  const activeBaseWords = baseWords.filter(w => !deletedBaseSet.has(w.id))
  const deletedWords = baseWords.filter(w => deletedBaseSet.has(w.id))

  const filterWords = (words: VocabEntry[]) => {
    if (!search.trim()) return words
    const s = search.toLowerCase()
    return words.filter(
      w => w.german.toLowerCase().includes(s) || w.russian.toLowerCase().includes(s)
    )
  }

  const renderWord = (word: VocabEntry, isCustom: boolean, isDeleted: boolean) => (
    <div key={word.id} className="word-item">
      <div className="word-item-text">
        <span className="word-german">{word.german}</span>
        <span className="word-russian">{word.russian}</span>
      </div>
      {isDeleted ? (
        <button
          className="word-action restore"
          onClick={() => onRestoreBase(word.id)}
          aria-label="Restore"
        >
          ↩
        </button>
      ) : (
        <button
          className="word-action delete"
          onClick={() => isCustom ? onDeleteCustom(word.id) : onDeleteBase(word.id)}
          aria-label="Delete"
        >
          ×
        </button>
      )}
    </div>
  )

  const currentWords = tab === 'active' 
    ? filterWords(activeBaseWords)
    : tab === 'custom'
    ? filterWords(customWords)
    : filterWords(deletedWords)

  return (
    <div className="menu-overlay" onClick={onClose}>
      <div className="menu-screen word-list-screen" onClick={(e) => e.stopPropagation()}>
        <button className="menu-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 className="menu-title">Manage Words</h2>

        <div className="word-tabs">
          <button
            className={`word-tab ${tab === 'active' ? 'active' : ''}`}
            onClick={() => setTab('active')}
          >
            Base ({activeBaseWords.length})
          </button>
          <button
            className={`word-tab ${tab === 'custom' ? 'active' : ''}`}
            onClick={() => setTab('custom')}
          >
            Custom ({customWords.length})
          </button>
          <button
            className={`word-tab ${tab === 'deleted' ? 'active' : ''}`}
            onClick={() => setTab('deleted')}
          >
            Deleted ({deletedWords.length})
          </button>
        </div>

        <input
          type="text"
          className="word-search"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="word-list">
          {currentWords.length === 0 ? (
            <p className="word-empty">
              {search ? 'Nothing found' : 'No words'}
            </p>
          ) : (
            currentWords.map(w => renderWord(w, tab === 'custom', tab === 'deleted'))
          )}
        </div>

        <button className="menu-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
