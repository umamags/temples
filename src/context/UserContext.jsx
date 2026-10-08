import { createContext, useState, useEffect } from 'react'

export const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('temples:user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Error parsing stored user:', e)
      }
    }
  }, [])

  const setUserData = (userData) => {
    setUser(userData)
    if (userData) {
      localStorage.setItem('temples:user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('temples:user')
    }
  }

  return (
    <UserContext.Provider value={{ user, setUserData }}>
      {children}
    </UserContext.Provider>
  )
}
