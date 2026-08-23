import { useState, useEffect } from 'react'

const STORAGE_KEY = 'temples:username'

export function useUsername() {
  const [username, setUsername] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored || 'Guest'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, username)
  }, [username])

  return {
    username,
    setUsername,
  }
}
