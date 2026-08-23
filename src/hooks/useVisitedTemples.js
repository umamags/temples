import { useState, useEffect } from 'react'

const STORAGE_KEY = 'temples:visited'

export function useVisitedTemples() {
  const [visitedTemples, setVisitedTemples] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return new Set(JSON.parse(stored))
      } catch (e) {
        console.error('Error parsing visited temples:', e)
        return new Set()
      }
    }
    return new Set()
  })

  // Sync to localStorage whenever visitedTemples changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(visitedTemples)))
  }, [visitedTemples])

  const getTempleKey = (temple, format) => {
    const cityOrTown = format === 'temples2' ? temple.town : temple.city
    return `${temple.state}-${cityOrTown}-${temple.name}`
  }

  const isVisited = (temple, format) => {
    return visitedTemples.has(getTempleKey(temple, format))
  }

  const toggleVisited = (temple, format) => {
    const key = getTempleKey(temple, format)
    const newVisited = new Set(visitedTemples)
    if (newVisited.has(key)) {
      newVisited.delete(key)
    } else {
      newVisited.add(key)
    }
    setVisitedTemples(newVisited)
  }

  const clearAllVisited = () => {
    setVisitedTemples(new Set())
  }

  return {
    visitedTemples,
    isVisited,
    toggleVisited,
    clearAllVisited,
    getTempleKey,
    visitCount: visitedTemples.size,
  }
}
