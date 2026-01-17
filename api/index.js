app.post('/api/user/update-profile', upload.single('avatar'), async (req, res) => {
  try {
    const email = xss(req.body.email)
    const name = xss(req.body.name)
    const bio = xss(req.body.bio || '') // Baru
    const phone = xss(req.body.phone || '') // Baru
    const file = req.file

    let avatarUrl = null
    
    if (file) {
      if (!file.mimetype.startsWith('image/')) return res.status(400).json({success: false, error: "Hanya file gambar diizinkan"})
      
      // Hapus karakter aneh di nama file
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '')
      const fileName = `${crypto.randomUUID()}_${safeName}`
      
      const { error } = await supabase.storage.from('avatars').upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
      avatarUrl = publicUrl
    }

    const updateData = { name, bio, phone }
    if (avatarUrl) updateData.avatar_url = avatarUrl

    const { error: dbError } = await supabase.from('users').update(updateData).eq('email', email)
    if (dbError) throw dbError

    const { data: updatedUser } = await supabase.from('users').select('*').eq('email', email).single()
    res.json({ success: true, message: 'Profil diperbarui', user: updatedUser })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})
