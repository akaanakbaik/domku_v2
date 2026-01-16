import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

dotenv.config()

const app = express()

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

// --- HTML EMAIL TEMPLATE (V4 - Perfected) ---
const sendEmail = async (to, subject, title, message, buttonText, buttonLink) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { background: #0f172a; padding: 30px; text-align: center; }
        .logo { width: 150px; height: auto; object-fit: contain; }
        .body { padding: 40px 30px; color: #334155; line-height: 1.6; }
        .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 24px; }
        .otp { background: #eff6ff; color: #1e40af; font-size: 32px; font-weight: 800; letter-spacing: 6px; text-align: center; padding: 20px; border-radius: 8px; margin: 24px 0; border: 2px dashed #bfdbfe; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/logodomku_nobg.png" alt="Domku" class="logo">
        </div>
        <div class="body">
          <div class="title">${title}</div>
          <p>${message}</p>
          
          ${buttonText ? `<div style="text-align:center"><a href="${buttonLink}" class="btn">${buttonText}</a></div>` : ''}
          ${!buttonText && buttonLink ? `<div class="otp">${buttonLink}</div>` : ''}
          
          <p style="margin-top: 30px; font-size: 13px; color: #64748b;">Abaikan jika ini bukan aktivitas Anda.</p>
        </div>
        <div class="footer">&copy; 2026 Domku Manager.<br>Padang, Indonesia 🇮🇩</div>
      </div>
    </body>
    </html>
  `
  await transporter.sendMail({ from: `"Domku Team" <${process.env.NODEMAILER_EMAIL}>`, to, subject, html: htmlContent })
}

const NAME_REGEX = /^[a-zA-Z0-9#!_-]+$/

app.get('/api', (req, res) => res.status(200).json({ status: 'Online' }))

// --- REGISTER ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, origin } = req.body
    if (!name || !email || !password) return res.status(400).json({ success: false, error: "Semua data wajib diisi." })
    if (!NAME_REGEX.test(name)) return res.status(400).json({ success: false, error: "Nama mengandung karakter ilegal." })
    if (password.length < 6) return res.status(400).json({ success: false, error: "Password minimal 6 karakter." })

    const { data: { users } } = await supabase.auth.admin.listUsers()
    if (users.find(u => u.email === email)) return res.status(400).json({ success: false, error: "Email sudah terdaftar." })

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    const token = crypto.randomBytes(32).toString('hex')

    const { error: dbError } = await supabase.from('pending_registrations').upsert({ name, email, password_hash: passwordHash, token, created_at: new Date() }, { onConflict: 'email' })
    if (dbError) throw new Error(dbError.message)

    await sendEmail(email, 'Verifikasi Akun', `Hai, ${name}!`, 'Klik tombol di bawah untuk mengaktifkan akun.', 'Verifikasi Email', `${origin}/verify-email?token=${token}`)
    res.json({ success: true, message: 'Link verifikasi dikirim ke email.' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// --- VERIFY EMAIL ---
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body
    const { data: pending } = await supabase.from('pending_registrations').select('*').eq('token', token).single()
    if (!pending) return res.status(400).json({ success: false, error: "Token expired/invalid." })

    const apiKey = crypto.randomBytes(12).toString('hex')
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const existing = users.find(u => u.email === pending.email)
    let userId = existing ? existing.id : null

    if (!userId) {
       const { data: authUser } = await supabase.auth.admin.createUser({
        email: pending.email,
        password: "DOMKU_SECURE_" + crypto.randomBytes(8).toString('hex'),
        user_metadata: { name: pending.name, api_key: apiKey },
        email_confirm: true
      })
      userId = authUser.user.id
    } else {
      await supabase.auth.admin.updateUserById(userId, { user_metadata: { name: pending.name, api_key: apiKey }, email_confirm: true })
    }

    await supabase.from('users').upsert({ id: userId, email: pending.email, name: pending.name, api_key: apiKey, password_hash: pending.password_hash })
    await supabase.from('pending_registrations').delete().eq('id', pending.id)

    res.json({ success: true, message: 'Akun Aktif.' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// --- LOGIN CHECK ---
app.post('/api/auth/login-check', async (req, res) => {
  try {
    const { email, password } = req.body
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    if (!user) return res.status(400).json({ success: false, error: "Email belum terdaftar." })

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return res.status(400).json({ success: false, error: "Password salah." })

    const code = Math.floor(1000 + Math.random() * 9000).toString()
    await supabase.from('verification_codes').upsert({ email, code }, { onConflict: 'email' })
    await sendEmail(email, 'Login OTP', 'Kode Masuk', 'Gunakan kode OTP ini untuk masuk ke Dashboard.', null, code)

    res.json({ success: true, message: 'OTP dikirim' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// --- VERIFY OTP (UPDATE PENTING) ---
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body
    
    // 1. Cek OTP
    const { data: otpData } = await supabase.from('verification_codes').select('*').eq('email', email).eq('code', code).single()
    if (!otpData) return res.status(400).json({ success: false, error: "Kode OTP Salah." })
    
    // 2. Ambil Data User Lengkap (Untuk Session)
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    
    // 3. Hapus OTP
    await supabase.from('verification_codes').delete().eq('email', email)
    
    // 4. Kirim Data User ke Frontend
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        api_key: user.api_key
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// --- SUBDOMAIN ---
app.post('/api/subdomain', async (req, res) => {
  const apiKey = req.headers['x-api-key']
  if (!apiKey) return res.status(401).json({ success: false, error: "API Key Required" })
  const { data: user } = await supabase.from('users').select('id').eq('api_key', apiKey).single()
  if (!user) return res.status(403).json({ success: false, error: "Invalid API Key" })

  try {
    const { subdomain, recordType, target } = req.body
    if (!subdomain || !recordType || !target) return res.status(400).json({ error: "Data Incomplete" })
    
    const { count } = await supabase.from('subdomains').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if (count >= 30) return res.status(400).json({ error: "Limit Max 30 Reached" })

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
