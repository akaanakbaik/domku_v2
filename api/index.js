import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import multer from 'multer' // Wajib install: npm install multer

dotenv.config()

const app = express()
const upload = multer({ storage: multer.memoryStorage() }) // Untuk handle upload file

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

app.use(cors())
app.use(express.json())

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD
  }
})

const sendEmail = async (to, subject, title, message, buttonText, buttonLink) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 40px auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #0f172a; padding: 20px; text-align: center; }
        .logo { width: 120px; }
        .body { padding: 30px; color: #334155; }
        .btn { display: inline-block; background: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
        .otp { background: #eff6ff; color: #1d4ed8; font-size: 28px; font-weight: bold; text-align: center; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px dashed #93c5fd; letter-spacing: 4px; }
        .footer { background: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/logodomku_nobg.png" alt="Domku" class="logo">
        </div>
        <div class="body">
          <h2 style="margin-top:0">${title}</h2>
          <p>${message}</p>
          ${buttonText ? `<div style="text-align:center"><a href="${buttonLink}" class="btn">${buttonText}</a></div>` : ''}
          ${!buttonText && buttonLink ? `<div class="otp">${buttonLink}</div>` : ''}
        </div>
        <div class="footer">&copy; 2026 Domku Manager</div>
      </div>
    </body>
    </html>
  `
  await transporter.sendMail({ from: `"Domku Team" <${process.env.NODEMAILER_EMAIL}>`, to, subject, html: htmlContent })
}

app.get('/api', (req, res) => res.json({ status: 'Online V4' }))

// --- AUTH ENDPOINTS ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, origin } = req.body
    if (!name || !email || !password) return res.status(400).json({ success: false, error: "Data tidak lengkap" })
    
    const { data: { users } } = await supabase.auth.admin.listUsers()
    if (users.find(u => u.email === email)) return res.status(400).json({ success: false, error: "Email sudah terdaftar" })

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    const token = crypto.randomBytes(32).toString('hex')

    const { error } = await supabase.from('pending_registrations').upsert({ name, email, password_hash: passwordHash, token, created_at: new Date() }, { onConflict: 'email' })
    if (error) throw error

    await sendEmail(email, 'Verifikasi Akun', `Halo ${name}`, 'Klik tombol di bawah untuk verifikasi.', 'Verifikasi Email', `${origin}/verify-email?token=${token}`)
    res.json({ success: true, message: 'Link verifikasi dikirim.' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body
    const { data: pending } = await supabase.from('pending_registrations').select('*').eq('token', token).single()
    if (!pending) return res.status(400).json({ success: false, error: "Token invalid" })

    const apiKey = crypto.randomBytes(12).toString('hex')
    let userId

    const { data: { users } } = await supabase.auth.admin.listUsers()
    const existing = users.find(u => u.email === pending.email)

    if (existing) {
      userId = existing.id
      await supabase.auth.admin.updateUserById(userId, { user_metadata: { name: pending.name, api_key: apiKey }, email_confirm: true })
    } else {
      const { data: authUser } = await supabase.auth.admin.createUser({
        email: pending.email,
        password: "DOMKU_SECURE_" + crypto.randomBytes(8).toString('hex'),
        user_metadata: { name: pending.name, api_key: apiKey },
        email_confirm: true
      })
      userId = authUser.user.id
    }

    await supabase.from('users').upsert({ id: userId, email: pending.email, name: pending.name, api_key: apiKey, password_hash: pending.password_hash })
    await supabase.from('pending_registrations').delete().eq('id', pending.id)

    res.json({ success: true, message: 'Akun Aktif.' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/auth/login-check', async (req, res) => {
  try {
    const { email, password } = req.body
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    if (!user) return res.status(400).json({ success: false, error: "Email tidak ditemukan" })

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return res.status(400).json({ success: false, error: "Password salah" })

    const code = Math.floor(1000 + Math.random() * 9000).toString()
    await supabase.from('verification_codes').upsert({ email, code }, { onConflict: 'email' })
    await sendEmail(email, 'Login OTP', 'Kode Masuk', 'Gunakan kode ini untuk masuk.', null, code)

    res.json({ success: true, message: 'OTP dikirim' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body
    const { data: otp } = await supabase.from('verification_codes').select('*').eq('email', email).eq('code', code).single()
    if (!otp) return res.status(400).json({ success: false, error: "OTP Salah" })

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    await supabase.from('verification_codes').delete().eq('email', email)

    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// --- USER SETTINGS ENDPOINTS ---

// 1. Update Profile (Name & Avatar)
app.post('/api/user/update-profile', upload.single('avatar'), async (req, res) => {
  try {
    const { email, name } = req.body
    const file = req.file

    let avatarUrl = null
    
    // Jika ada file upload
    if (file) {
      const fileName = `${Date.now()}_${file.originalname}`
      const { data, error } = await supabase.storage.from('avatars').upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      })
      
      if (error) throw error
      
      // Get Public URL
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
      avatarUrl = publicUrl
    }

    // Update DB
    const updateData = { name }
    if (avatarUrl) updateData.avatar_url = avatarUrl

    const { error: dbError } = await supabase.from('users').update(updateData).eq('email', email)
    if (dbError) throw dbError

    // Return updated user
    const { data: updatedUser } = await supabase.from('users').select('*').eq('email', email).single()
    
    res.json({ success: true, message: 'Profil diperbarui', user: updatedUser })

  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// 2. Change Password
app.post('/api/user/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()

    const isValid = await bcrypt.compare(oldPassword, user.password_hash)
    if (!isValid) return res.status(400).json({ success: false, error: "Password lama salah" })

    const salt = await bcrypt.genSalt(10)
    const newHash = await bcrypt.hash(newPassword, salt)

    await supabase.from('users').update({ password_hash: newHash }).eq('email', email)
    
    res.json({ success: true, message: 'Password berhasil diubah' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// 3. Request Reset Password OTP
app.post('/api/user/reset-password-request', async (req, res) => {
  try {
    const { email } = req.body
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    if (!user) return res.status(400).json({ success: false, error: "Email tidak ditemukan" })

    const code = Math.floor(1000 + Math.random() * 9000).toString()
    await supabase.from('verification_codes').upsert({ email, code }, { onConflict: 'email' })
    await sendEmail(email, 'Reset Password', 'Kode Reset', 'Gunakan kode ini untuk mereset password Anda.', null, code)

    res.json({ success: true, message: 'OTP Reset dikirim ke email' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// 4. Confirm Reset Password
app.post('/api/user/reset-password-confirm', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body
    
    const { data: otp } = await supabase.from('verification_codes').select('*').eq('email', email).eq('code', code).single()
    if (!otp) return res.status(400).json({ success: false, error: "Kode OTP Salah" })

    const salt = await bcrypt.genSalt(10)
    const newHash = await bcrypt.hash(newPassword, salt)

    await supabase.from('users').update({ password_hash: newHash }).eq('email', email)
    await supabase.from('verification_codes').delete().eq('email', email)

    res.json({ success: true, message: 'Password berhasil direset' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// --- SUBDOMAIN ---
app.post('/api/subdomain', async (req, res) => {
  const apiKey = req.headers['x-api-key']
  const { data: user } = await supabase.from('users').select('id').eq('api_key', apiKey).single()
  if (!user) return res.status(403).json({ success: false, error: "Invalid API Key" })

  try {
    const { subdomain, recordType, target } = req.body
    if (!subdomain || !recordType || !target) return res.status(400).json({ error: "Data Incomplete" })
    
    const { count } = await supabase.from('subdomains').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if (count >= 30) return res.status(400).json({ error: "Max Limit 30" })

    const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Email': process.env.CLOUDFLARE_EMAIL, 'X-Auth-Key': process.env.CLOUDFLARE_API_KEY },
      body: JSON.stringify({ type: recordType, name: subdomain, content: target, ttl: 1, proxied: true })
    })
    const cfData = await cfResponse.json()
    if (!cfData.success) throw new Error(cfData.errors[0]?.message || 'CF Error')

    await supabase.from('subdomains').insert({ user_id: user.id, name: `${subdomain}.domku.my.id`, target, type: recordType, cf_id: cfData.result.id })
    res.json({ success: true, data: cfData.result })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default app
