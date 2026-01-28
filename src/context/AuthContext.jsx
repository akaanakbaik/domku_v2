import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isImpersonating, setIsImpersonating] = useState(false)

  const fetchUser = useCallback(() => {
    try {
      const adminBackup = sessionStorage.getItem('domku_admin_backup')
      
      if (adminBackup) {
        setIsImpersonating(true)
      } else {
        setIsImpersonating(false)
      }

      const sessionStr = localStorage.getItem('domku_session')
      if (sessionStr) {
        const session = JSON.parse(sessionStr)
        if (session && session.email) {
          setUser(session)
        } else {
          localStorage.removeItem('domku_session')
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Auth Initialization Error:", error)
      localStorage.removeItem('domku_session')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
    
    const handleStorageChange = () => fetchUser()
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('session-update', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('session-update', handleStorageChange)
    }
  }, [fetchUser])

  const login = (userData) => {
    try {
      localStorage.setItem('domku_session', JSON.stringify(userData))
      setUser(userData)
      window.dispatchEvent(new Event('session-update'))
    } catch (error) {
      console.error("Login Error:", error)
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem('domku_session')
      sessionStorage.removeItem('domku_admin_backup')
      setUser(null)
      setIsImpersonating(false)
      window.dispatchEvent(new Event('session-update'))
      window.location.href = '/auth'
    } catch (error) {
      console.error("Logout Error:", error)
    }
  }

  const impersonate = async (targetUserId) => {
    try {
      if (!user || !user.email) {
        throw new Error("No active admin session found.")
      }

      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': user.email 
        },
        body: JSON.stringify({ userId: targetUserId })
      })

      const data = await response.json()

      if (data.success && data.user) {
        sessionStorage.setItem('domku_admin_backup', JSON.stringify(user))

        localStorage.setItem('domku_session', JSON.stringify(data.user))
        
        setUser(data.user)
        setIsImpersonating(true)
        
        window.dispatchEvent(new Event('session-update'))
        
        window.location.href = '/subdomain' 
        return true
      } else {
        throw new Error(data.error || "Failed to impersonate user.")
      }
    } catch (error) {
      console.error("Impersonate Logic Failed:", error)
      throw error
    }
  }

  const stopImpersonate = () => {
    try {
      const adminBackup = sessionStorage.getItem('domku_admin_backup')
      
      if (adminBackup) {
        localStorage.setItem('domku_session', adminBackup)
        
        sessionStorage.removeItem('domku_admin_backup')
        
        setUser(JSON.parse(adminBackup))
        setIsImpersonating(false)
        
        window.dispatchEvent(new Event('session-update'))
        
        window.location.href = '/k-control-panel-x9z' 
      } else {
        logout()
      }
    } catch (error) {
      console.error("Stop Impersonate Failed:", error)
      logout()
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isImpersonating,
      login, 
      logout, 
      refreshSession: fetchUser, 
      impersonate, 
      stopImpersonate 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider