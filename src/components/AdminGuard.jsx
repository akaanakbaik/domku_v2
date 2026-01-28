import React, { useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Loader from './Loader'

const AdminGuard = ({ children }) => {
  const { user } = useOutletContext() || {}
  const navigate = useNavigate()

  useEffect(() => {
    // SECURITY CHECK LEVEL 2: Route Guard
    // Jika user tidak ada ATAU email tidak cocok, tendang ke Home
    if (!user || user.email !== 'khaliqarrasyidabdul@gmail.com') {
      console.warn("Unauthorized Admin Access Attempt Blocked.")
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  // Tampilkan loader sementara checking berlangsung agar konten Admin tidak "bocor"
  if (!user || user.email !== 'khaliqarrasyidabdul@gmail.com') {
    return <Loader />
  }

  return children
}

export default AdminGuard
