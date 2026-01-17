import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import multer from 'multer'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import xss from 'xss'

dotenv.config()

const app = express()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } })

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Terlalu banyak request. Coba lagi nanti." }
})

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 20, 
  message: { success: false, error: "Terlalu banyak percobaan login/daftar. Tunggu 1 jam." }
})

app.use(helmet())
app.use(cors({ origin: true, credentials: true })) 
app.use(express.json({ limit: '10kb' })) 
app.use(limiter)

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD
  }
})

const BANNED_SUBDOMAINS = [
  'www', 'mail', 'remote', 'blog', 'webmail', 'server', 'ns1', 'ns2', 'smtp', 'secure', 
  'vpn', 'm', 'shop', 'admin', 'panel', 'cpanel', 'whm', 'billing', 'support', 'test', 
  'dev', 'root', 'ftp', 'pop', 'imap', 'status', 'api', 'app', 'dashboard', 'auth', 'login'
]

// REGEX BARU: Mengizinkan huruf, angka, titik, dan strip. 
// Tidak boleh diawali atau diakhiri dengan titik/strip.
const SUBDOMAIN_REGEX = /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/

const sendEmail = async (to, subject, title, message, buttonText, buttonLink) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { background: #0f172a; padding: 30px; text-align: center; }
        .logo { width: 140px; height: auto; }
        .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
        .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 24px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2); }
        .otp { background: #eff6ff; color: #1e40af; font-size: 32px; font-weight: 800; letter-spacing: 5px; text-align: center; padding: 20px; border-radius: 12px; margin: 20px 0; border: 2px dashed #bfdbfe; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/logodomku_nobg.png" alt="Domku" class="logo">
        </div>
        <div class="content">
          <h2 style="color:#0f172a;margin-top:0;">${title}</h2>
          <p>${message}</p>
          ${buttonText ? `<div style="text-align:center"><a href="${buttonLink}" class="btn">${buttonText}</a></div>` : ''}
          ${!buttonText && buttonLink ? `<div class="otp">${buttonLink}</div>` : ''}
        </div>
        <div class="footer">&copy; 2026 Domku Manager. Padang, Indonesia 🇮🇩</div>
      </div>
    </body>
    </html>
  `
  await transporter.sendMail({ from: `"Domku Security" <${process.env.NODEMAILER_EMAIL}>`, to, subject, html: htmlContent })
}

app.get('/api', (req, res) => {
  res.json({ 
    status: 'Secure Online', 
    version: '4.1.0',
    features: ['Anti-DDoS', 'Rate Limit', 'Cloudflare Check', 'Strict Auth', 'Multi-level Subdomain'] 
  })
})

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const name = xss(req.body.name)
    const email = xss(req.body.email)
    const password = req.body.password
    const origin = req.body.origin

    if (!name || !email || !password) return res.status(400).json({ success: false, error: "Data tidak lengkap" })
    
    const { data: { users } } = await supabase.auth.admin.listUsers()
    if (users.find(u => u.email === email)) return res.status(400).json({ success: false, error: "Email sudah terdaftar" })

    const salt = await bcrypt.genSalt(12) 
    const passwordHash = await bcrypt.hash(password, salt)
    const token = crypto.randomBytes(32).toString('hex')

    const { error } = await supabase.from('pending_registrations').upsert({ name, email, password_hash: passwordHash, token, created_at: new Date() }, { onConflict: 'email' })
    if (error) throw error

    await sendEmail(email, 'Verifikasi Akun', `Selamat Datang, ${name}`, 'Amankan akun Anda dengan memverifikasi email sekarang.', 'Verifikasi Akun', `${origin}/verify-email?token=${token}`)
    res.json({ success: true, message: 'Link verifikasi dikirim.' })
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" }) 
  }
})

app.post('/api/auth/verify-email', authLimiter, async (req, res) => {
  try {
    const { token } = req.body
    const { data: pending } = await supabase.from('pending_registrations').select('*').eq('token', token).single()
    if (!pending) return res.status(400).json({ success: false, error: "Token invalid atau expired" })

    const apiKey = crypto.randomBytes(24).toString('hex') 
    let userId

    const { data: { users } } = await supabase.auth.admin.listUsers()
    const existing = users.find(u => u.email === pending.email)

    if (existing) {
      userId = existing.id
      await supabase.auth.admin.updateUserById(userId, { user_metadata: { name: pending.name, api_key: apiKey }, email_confirm: true })
    } else {
      const { data: authUser } = await supabase.auth.admin.createUser({
        email: pending.email,
        password: "SECURE_" + crypto.randomBytes(16).toString('hex'),
        user_metadata: { name: pending.name, api_key: apiKey },
        email_confirm: true
      })
      userId = authUser.user.id
    }

    await supabase.from('users').upsert({ id: userId, email: pending.email, name: pending.name, api_key: apiKey, password_hash: pending.password_hash })
    await supabase.from('pending_registrations').delete().eq('id', pending.id)

    res.json({ success: true, message: 'Akun Aktif.' })
  } catch (error) {
    res.status(500).json({ success: false, error: "Verifikasi gagal" })
  }
})

app.post('/api/auth/login-check', authLimiter, async (req, res) => {
  try {
    const email = xss(req.body.email)
    const password = req.body.password

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    if (!user) return res.status(400).json({ success: false, error: "Kredensial tidak valid" })

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return res.status(400).json({ success: false, error: "Kredensial tidak valid" }) 

    const code = Math.floor(1000 + Math.random() * 9000).toString()
    await supabase.from('verification_codes').upsert({ email, code }, { onConflict: 'email' })
    await sendEmail(email, 'Login OTP', 'Akses Masuk', 'Kode ini bersifat rahasia. Jangan berikan kepada siapapun.', null, code)

    res.json({ success: true, message: 'OTP dikirim' })
  } catch (error) {
    res.status(500).json({ success: false, error: "Login Error" })
  }
})

app.post('/api/auth/verify-otp', authLimiter, async (req, res) => {
  try {
    const { email, code } = req.body
    const { data: otp } = await supabase.from('verification_codes').select('*').eq('email', email).eq('code', code).single()
    if (!otp) return res.status(400).json({ success: false, error: "OTP Salah" })

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    await supabase.from('verification_codes').delete().eq('email', email)

    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, error: "Verifikasi Gagal" })
  }
})

app.post('/api/user/update-profile', upload.single('avatar'), async (req, res) => {
  try {
    const email = xss(req.body.email)
    const name = xss(req.body.name)
    const file = req.file

    let avatarUrl = null
    
    if (file) {
      if (!file.mimetype.startsWith('image/')) return res.status(400).json({success: false, error: "Hanya file gambar diizinkan"})
      
      const fileName = `${crypto.randomUUID()}_${file.originalname.replace(/[^a-zA-Z0-9.]/g, '')}`
      const { error } = await supabase.storage.from('avatars').upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
      avatarUrl = publicUrl
    }

    const updateData = { name }
    if (avatarUrl) updateData.avatar_url = avatarUrl

    const { error: dbError } = await supabase.from('users').update(updateData).eq('email', email)
    if (dbError) throw dbError

    const { data: updatedUser } = await supabase.from('users').select('*').eq('email', email).single()
    res.json({ success: true, message: 'Profil diperbarui', user: updatedUser })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/user/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()

    const isValid = await bcrypt.compare(oldPassword, user.password_hash)
    if (!isValid) return res.status(400).json({ success: false, error: "Password lama salah" })

    if(newPassword.length < 6) return res.status(400).json({success: false, error: "Password terlalu pendek"})

    const salt = await bcrypt.genSalt(12)
    const newHash = await bcrypt.hash(newPassword, salt)

    await supabase.from('users').update({ password_hash: newHash }).eq('email', email)
    res.json({ success: true, message: 'Password diubah' })
  } catch (error) {
    res.status(500).json({ success: false, error: "Gagal ubah password" })
  }
})

app.post('/api/user/reset-password-request', async (req, res) => {
  try {
    const { email } = req.body
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    if (!user) return res.status(400).json({ success: false, error: "Email tidak ditemukan" })

    const code = Math.floor(1000 + Math.random() * 9000).toString()
    await supabase.from('verification_codes').upsert({ email, code }, { onConflict: 'email' })
    await sendEmail(email, 'Reset Password', 'Permintaan Reset', 'Gunakan kode ini untuk mereset password.', null, code)

    res.json({ success: true, message: 'OTP dikirim' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/user/reset-password-confirm', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body
    
    const { data: otp } = await supabase.from('verification_codes').select('*').eq('email', email).eq('code', code).single()
    if (!otp) return res.status(400).json({ success: false, error: "Kode OTP Salah" })

    const salt = await bcrypt.genSalt(12)
    const newHash = await bcrypt.hash(newPassword, salt)

    await supabase.from('users').update({ password_hash: newHash }).eq('email', email)
    await supabase.from('verification_codes').delete().eq('email', email)

    res.json({ success: true, message: 'Password direset' })
  } catch (error) {
    res.status(500).json({ success: false, error: "Gagal reset" })
  }
})

app.post('/api/subdomain', limiter, async (req, res) => {
  const apiKey = req.headers['x-api-key']
  if(!apiKey) return res.status(401).json({ success: false, error: "Unauthorized" })

  const { data: user } = await supabase.from('users').select('id').eq('api_key', apiKey).single()
  if (!user) return res.status(403).json({ success: false, error: "Invalid API Key" })

  try {
    const subdomain = xss(req.body.subdomain).toLowerCase()
    const recordType = req.body.recordType
    const target = xss(req.body.target)

    if (!subdomain || !recordType || !target) return res.status(400).json({ error: "Data tidak lengkap" })
    
    // VALIDASI BARU: Membolehkan titik dan strip
    if (!SUBDOMAIN_REGEX.test(subdomain)) return res.status(400).json({ error: "Nama hanya boleh huruf, angka, titik (.), dan strip (-)" })
    if (BANNED_SUBDOMAINS.includes(subdomain)) return res.status(400).json({ error: "Nama subdomain ini dilarang" })
    if (subdomain.length < 3 || subdomain.length > 63) return res.status(400).json({ error: "Panjang nama harus 3-63 karakter" })

    const { count } = await supabase.from('subdomains').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if (count >= 30) return res.status(400).json({ error: "Limit Max 30 Subdomain" })

    const checkCf = await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records?name=${subdomain}.domku.my.id`, {
        headers: { 'Content-Type': 'application/json', 'X-Auth-Email': process.env.CLOUDFLARE_EMAIL, 'X-Auth-Key': process.env.CLOUDFLARE_API_KEY }
    })
    const checkData = await checkCf.json()
    if (checkData.result.length > 0) return res.status(400).json({ error: "Subdomain sudah digunakan orang lain" })

    const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Email': process.env.CLOUDFLARE_EMAIL, 'X-Auth-Key': process.env.CLOUDFLARE_API_KEY },
      body: JSON.stringify({ type: recordType, name: subdomain, content: target, ttl: 1, proxied: true })
    })
    const cfData = await cfResponse.json()
    if (!cfData.success) throw new Error(cfData.errors[0]?.message || 'Cloudflare API Error')

    await supabase.from('subdomains').insert({ user_id: user.id, name: `${subdomain}.domku.my.id`, target, type: recordType, cf_id: cfData.result.id })
    res.json({ success: true, data: cfData.result })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.get('/api/lookup-ip', async (req, res) => {
    const ip = req.query.ip
    if(!ip) return res.json({ country: 'Unknown' })
    try {
        const lookup = await fetch(`http://ip-api.com/json/${ip}`)
        const data = await lookup.json()
        res.json({ country: data.country || 'Unknown', city: data.city || 'Unknown', isp: data.isp })
    } catch (e) {
        res.json({ country: 'Unknown' })
    }
})

export default app
