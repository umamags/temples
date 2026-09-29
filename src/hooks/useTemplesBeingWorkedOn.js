import { useState, useEffect } from 'react'

const STORAGE_KEY = 'temples_being_worked_on'

export function useTemplesBeingWorkedOn() {
  const [temples, setTemples] = useState([])
  const [loading, setLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setTemples(JSON.parse(stored))
      }
    } catch (err) {
      console.error('Error loading temples from storage:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Save to localStorage whenever temples change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(temples))
      } catch (err) {
        console.error('Error saving temples to storage:', err)
      }
    }
  }, [temples, loading])

  const addTemple = (templeId, templeName) => {
    setTemples(prev => {
      const exists = prev.some(t => t.id === templeId)
      if (exists) return prev
      return [...prev, { id: templeId, name: templeName }]
    })
  }

  const removeTemple = (templeId) => {
    setTemples(prev => prev.filter(t => t.id !== templeId))
  }

  const clearAll = () => {
    setTemples([])
  }

  return {
    temples,
    addTemple,
    removeTemple,
    clearAll,
    loading
  }
}
