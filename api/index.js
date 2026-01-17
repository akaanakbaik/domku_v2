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

// Konfigurasi Upload
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 2 * 1024 * 1024 } 
})

// --- MIDDLEWARE KEAMANAN ---

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Rate limit exceeded. Try again later." }
})

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 20, 
  message: { success: false, error: "Too many login attempts. Wait 1 hour." }
})

app.use(helmet())
app.use(cors({ origin: true, credentials: true })) 
app.use(express.json({ limit: '10kb' })) 
app.use(limiter)

// --- KONEKSI ---

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

// --- KONFIGURASI VALIDASI ---

const BANNED_SUBDOMAINS = [
  'www', 'mail', 'remote', 'blog', 'webmail', 'server', 'ns1', 'ns2', 'smtp', 'secure', 
  'vpn', 'm', 'shop', 'admin', 'panel', 'cpanel', 'whm', 'billing', 'support', 'test', 
  'dev', 'root', 'ftp', 'pop', 'imap', 'status', 'api', 'app', 'dashboard', 'auth', 'login'
]

const SUBDOMAIN_REGEX = /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/

// --- HELPER FUNCTIONS ---

const logActivity = async (userId, action, details, req) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      details,
      ip_address: ip
    })
  } catch (e) {
    console.error("Log failed:", e)
  }
}

const sendEmail = async (to, subject, title, message, buttonText, buttonLink) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: sans-serif; background: #f1f5f9; padding: 20px; }
        .box { max-width: 500px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .btn { display: inline-block; background: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
        .otp { font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #1e40af; text-align: center; margin: 20px 0; background: #eff6ff; padding: 15px; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="box">
        <h2 style="color:#0f172a; text-align:center;">${title}</h2>
        <p style="color:#334155; line-height:1.6;">${message}</p>
        ${buttonText ? `<div style="text-align:center"><a href="${buttonLink}" class="btn">${buttonText}</a></div>` : ''}
        ${!buttonText && buttonLink ? `<div class="otp">${buttonLink}</div>` : ''}
        <hr style="border:0; border-top:1px solid #e2e8f0; margin-top:30px;">
        <p style="text-align:center; font-size:12px; color:#94a3b8;">&copy; 2026 Domku Manager</p>
      </div>
    </body>
    </html>
  `
  await transporter.sendMail({ from: `"Domku Security" <${process.env.NODEMAILER_EMAIL}>`, to, subject, html: htmlContent })
}

// --- ENDPOINTS ---

// 1. Status Checker (Untuk Sidebar Indicator)
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', timestamp: new Date(), version: '4.5.0' })
})

app.get('/api', (req, res) => res.json({ status: 'Active', endpoints: ['/auth', '/subdomain', '/user'] }))

// 2. Register
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const name = xss(req.body.name)
    const email = xss(req.body.email)
    const password = req.body.password
    const origin = req.body.origin

    if (!name || !email || !password) return res.status(400).json({ success: false, error: "Data tidak lengkap" })
    
    const { data: { users } } = await supabase.auth.admin.listUsers()
    if (users.find(u => u.email === email)) return res.status(400).json({ success: false, error: "Email terdaftar" })

    const salt = await bcrypt.genSalt(12) 
    const passwordHash = await bcrypt.hash(password, salt)
    const token = crypto.randomBytes(32).toString('hex')

    await supabase.from('pending_registrations').upsert({ name, email, password_hash: passwordHash, token }, { onConflict: 'email' })
    await sendEmail(email, 'Verifikasi Akun', `Halo ${name}`, 'Verifikasi email Anda untuk melanjutkan.', 'Verifikasi', `${origin}/verify-email?token=${token}`)
    
    res.json({ success: true, message: 'Cek email Anda.' })
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" }) 
  }
})

// 3. Verify Email
app.post('/api/auth/verify-email', authLimiter, async (req, res) => {
  try {
    const { token } = req.body
    const { data: pending } = await supabase.from('pending_registrations').select('*').eq('token', token).single()
    if (!pending) return res.status(400).json({ success: false, error: "Token invalid" })

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
    
    // Log Activity
    await logActivity(userId, 'REGISTER', 'User registered and verified', req)

    res.json({ success: true, message: 'Akun Aktif.' })
  } catch (error) {
    res.status(500).json({ success: false, error: "Verifikasi gagal" })
  }
})

// 4. Login Check
app.post('/api/auth/login-check', authLimiter, async (req, res) => {
  try {
    const email = xss(req.body.email)
    const password = req.body.password

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    if (!user) return res.status(400).json({ success: false, error: "Akun tidak ditemukan" })

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return res.status(400).json({ success: false, error: "Password salah" }) 

    const code = Math.floor(1000 + Math.random() * 9000).toString()
    await supabase.from('verification_codes').upsert({ email, code }, { onConflict: 'email' })
    await sendEmail(email, 'Login OTP', 'Kode Masuk', 'Kode OTP Login Anda:', null, code)

    res.json({ success: true, message: 'OTP dikirim' })
  } catch (error) {
    res.status(500).json({ success: false, error: "Login Error" })
  }
})

// 5. Verify OTP
app.post('/api/auth/verify-otp', authLimiter, async (req, res) => {
  try {
    const { email, code } = req.body
    const { data: otp } = await supabase.from('verification_codes').select('*').eq('email', email).eq('code', code).single()
    if (!otp) return res.status(400).json({ success: false, error: "OTP Salah" })

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    await supabase.from('verification_codes').delete().eq('email', email)
    
    await logActivity(user.id, 'LOGIN', 'Login via OTP Success', req)

    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, error: "Verifikasi Gagal" })
  }
})

// 6. Update Profile
app.post('/api/user/update-profile', upload.single('avatar'), async (req, res) => {
  try {
    const email = xss(req.body.email)
    const name = xss(req.body.name)
    const bio = xss(req.body.bio || '')
    const phone = xss(req.body.phone || '')
    const file = req.file

    let avatarUrl = null
    if (file) {
      if (!file.mimetype.startsWith('image/')) return res.status(400).json({success: false, error: "Hanya gambar"})
      const fileName = `${crypto.randomUUID()}_${file.originalname.replace(/[^a-zA-Z0-9.]/g, '')}`
      await supabase.storage.from('avatars').upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true })
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
      avatarUrl = publicUrl
    }

    const updateData = { name, bio, phone }
    if (avatarUrl) updateData.avatar_url = avatarUrl

    await supabase.from('users').update(updateData).eq('email', email)
    const { data: updatedUser } = await supabase.from('users').select('*').eq('email', email).single()
    
    await logActivity(updatedUser.id, 'UPDATE_PROFILE', 'User updated profile details', req)

    res.json({ success: true, message: 'Profil diperbarui', user: updatedUser })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// 7. Change Password
app.post('/api/user/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()

    const isValid = await bcrypt.compare(oldPassword, user.password_hash)
    if (!isValid) return res.status(400).json({ success: false, error: "Password lama salah" })

    if(newPassword.length < 6) return res.status(400).json({success: false, error: "Min 6 karakter"})

    const salt = await bcrypt.genSalt(12)
    const newHash = await bcrypt.hash(newPassword, salt)

    await supabase.from('users').update({ password_hash: newHash }).eq('email', email)
    await logActivity(user.id, 'CHANGE_PASSWORD', 'Password changed successfully', req)

    res.json({ success: true, message: 'Password diubah' })
  } catch (error) {
    res.status(500).json({ success: false, error: "Gagal" })
  }
})

// 8. Reset Password Request
app.post('/api/user/reset-password-request', async (req, res) => {
  try {
    const { email } = req.body
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    if (!user) return res.status(400).json({ success: false, error: "Email tidak ditemukan" })

    const code = Math.floor(1000 + Math.random() * 9000).toString()
    await supabase.from('verification_codes').upsert({ email, code }, { onConflict: 'email' })
    await sendEmail(email, 'Reset Password', 'Kode Reset', 'Gunakan kode ini:', null, code)

    res.json({ success: true, message: 'OTP dikirim' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// 9. Reset Password Confirm
app.post('/api/user/reset-password-confirm', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body
    const { data: otp } = await supabase.from('verification_codes').select('*').eq('email', email).eq('code', code).single()
    if (!otp) return res.status(400).json({ success: false, error: "Kode Salah" })

    const salt = await bcrypt.genSalt(12)
    const newHash = await bcrypt.hash(newPassword, salt)

    await supabase.from('users').update({ password_hash: newHash }).eq('email', email)
    await supabase.from('verification_codes').delete().eq('email', email)
    
    // Log activity tanpa user ID (karena belum login, pakai email lookup nanti jika perlu)
    
    res.json({ success: true, message: 'Password direset' })
  } catch (error) {
    res.status(500).json({ success: false, error: "Gagal" })
  }
})

// 10. Create Subdomain
app.post('/api/subdomain', limiter, async (req, res) => {
  const apiKey = req.headers['x-api-key']
  if(!apiKey) return res.status(401).json({ success: false, error: "Unauthorized" })

  const { data: user } = await supabase.from('users').select('id').eq('api_key', apiKey).single()
  if (!user) return res.status(403).json({ success: false, error: "Invalid Key" })

  try {
    const subdomain = xss(req.body.subdomain).toLowerCase()
    const recordType = req.body.recordType
    const target = xss(req.body.target)

    if (!subdomain || !recordType || !target) return res.status(400).json({ error: "Data Incomplete" })
    
    if (!SUBDOMAIN_REGEX.test(subdomain)) return res.status(400).json({ error: "Nama mengandung karakter ilegal" })
    if (BANNED_SUBDOMAINS.includes(subdomain)) return res.status(400).json({ error: "Subdomain dilarang" })
    if (subdomain.length < 3 || subdomain.length > 63) return res.status(400).json({ error: "Panjang 3-63 char" })

    const { count } = await supabase.from('subdomains').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if (count >= 30) return res.status(400).json({ error: "Limit Max 30" })

    // Cloudflare Check
    const checkCf = await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records?name=${subdomain}.domku.my.id`, {
        headers: { 'Content-Type': 'application/json', 'X-Auth-Email': process.env.CLOUDFLARE_EMAIL, 'X-Auth-Key': process.env.CLOUDFLARE_API_KEY }
    })
    const checkData = await checkCf.json()
    if (checkData.result.length > 0) return res.status(400).json({ error: "Subdomain sudah dipakai" })

    // Cloudflare Create
    const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Email': process.env.CLOUDFLARE_EMAIL, 'X-Auth-Key': process.env.CLOUDFLARE_API_KEY },
      body: JSON.stringify({ type: recordType, name: subdomain, content: target, ttl: 1, proxied: true })
    })
    const cfData = await cfResponse.json()
    if (!cfData.success) throw new Error(cfData.errors[0]?.message || 'CF Error')

    await supabase.from('subdomains').insert({ user_id: user.id, name: `${subdomain}.domku.my.id`, target, type: recordType, cf_id: cfData.result.id })
    
    await logActivity(user.id, 'CREATE_SUBDOMAIN', `Created ${subdomain}.domku.my.id`, req)

    res.json({ success: true, data: cfData.result })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// 11. IP Lookup
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
