import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

dotenv.config()

const app = express()

// Pastikan menggunakan Service Role Key
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

// --- HTML EMAIL TEMPLATE ---
const sendEmail = async (to, subject, title, message, buttonText, buttonLink) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e4e4e7; }
        .header { background: #0b0c10; padding: 30px; text-align: center; }
        .logo { width: 60px; height: 60px; object-fit: contain; }
        .content { padding: 40px 30px; color: #3f3f46; line-height: 1.6; }
        .h1 { color: #18181b; font-size: 24px; font-weight: 700; margin-bottom: 20px; }
        .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 24px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2); }
        .otp-box { background: #f0f9ff; color: #0369a1; font-size: 32px; font-weight: 800; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 8px; border: 1px dashed #bae6fd; margin: 20px 0; }
        .footer { background: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #f4f4f5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/logodomku_nobg.png" alt="Domku Logo" class="logo">
        </div>
        <div class="content">
          <div class="h1">${title}</div>
          <p>${message}</p>
          ${buttonText ? `<div style="text-align: center;"><a href="${buttonLink}" class="btn">${buttonText}</a></div>` : ''}
          ${!buttonText && buttonLink ? `<div class="otp-box">${buttonLink}</div>` : ''} 
          <p style="margin-top: 30px; font-size: 13px; color: #71717a;">
            Abaikan jika ini bukan permintaan Anda.
          </p>
        </div>
        <div class="footer">
          &copy; 2026 Domku Manager. All rights reserved.<br>
          Padang, Indonesia 🇮🇩
        </div>
      </div>
    </body>
    </html>
  `
  
  await transporter.sendMail({
    from: `"Domku Security" <${process.env.NODEMAILER_EMAIL}>`,
    to,
    subject,
    html: htmlContent
  })
}

const NAME_REGEX = /^[a-zA-Z0-9#!_-]+$/

app.get('/api', (req, res) => {
  res.status(200).json({ status: 'Online', system: 'Domku V3.2 Stable' })
})

// --- REGISTER ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, origin } = req.body

    if (!name || !email || !password) return res.status(400).json({ success: false, error: "Data tidak lengkap." })
    if (!NAME_REGEX.test(name)) return res.status(400).json({ success: false, error: "Nama mengandung karakter ilegal." })
    if (password.length < 6) return res.status(400).json({ success: false, error: "Password minimal 6 karakter." })

    // Cek User di Auth Supabase
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const userExists = users.find(u => u.email === email)
    if (userExists) return res.status(400).json({ success: false, error: "Email sudah terdaftar." })

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    const token = crypto.randomBytes(32).toString('hex')

    const { error: dbError } = await supabase
      .from('pending_registrations')
      .upsert({ 
        name, 
        email, 
        password_hash: passwordHash, 
        token,
        created_at: new Date()
      }, { onConflict: 'email' })

    if (dbError) throw new Error(dbError.message)

    const verifyLink = `${origin}/verify-email?token=${token}`
    await sendEmail(
      email,
      'Verifikasi Akun',
      `Selamat Datang, ${name}!`,
      'Klik tombol di bawah untuk mengaktifkan akun Anda.',
      'Verifikasi Sekarang',
      verifyLink
    )

    res.json({ success: true, message: 'Email verifikasi terkirim.' })
  } catch (error) {
    console.error("Register Error:", error)
    res.status(500).json({ success: false, error: error.message || "Server Error" })
  }
})

// --- VERIFY EMAIL (DIPERBAIKI: Logic Anti-Conflict) ---
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body

    // 1. Ambil data Pending
    const { data: pending, error } = await supabase.from('pending_registrations').select('*').eq('token', token).single()
    if (error || !pending) return res.status(400).json({ success: false, error: "Token tidak valid." })

    // 2. Generate API Key
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const apiKey = Array.from({length: 12}, () => chars[Math.floor(Math.random() * chars.length)]).join('')

    let userId = null

    // 3. CEK USER DI AUTH DULU (Anti-Error "Checking Email")
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const existingAuthUser = users.find(u => u.email === pending.email)

    if (existingAuthUser) {
      // Jika user hantu masih ada, kita pakai ID-nya (Recycle)
      userId = existingAuthUser.id
      console.log("User Auth sudah ada, menggunakan ID lama:", userId)
      
      // Update metadata user lama
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { name: pending.name, api_key: apiKey },
        email_confirm: true
      })
    } else {
      // Jika bersih, buat baru
      const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
        email: pending.email,
        password: "DOMKU_SECURE_" + crypto.randomBytes(10).toString('hex'),
        user_metadata: { name: pending.name, api_key: apiKey },
        email_confirm: true
      })
      
      if (createError) {
        // Jika error "Checking Email" muncul di sini, itu karena Race Condition atau Trigger.
        // Kita throw error agar frontend tau
        throw new Error("Auth Creation Failed: " + createError.message)
      }
      userId = authUser.user.id
    }

    // 4. Masukkan ke Public Users (Upsert agar jika ada data lama tertimpa)
    const { error: insertError } = await supabase.from('users').upsert({
      id: userId,
      email: pending.email,
      name: pending.name,
      api_key: apiKey,
      password_hash: pending.password_hash 
    })

    if (insertError) throw new Error("DB Public Insert Failed: " + insertError.message)

    // 5. Hapus Pending
    await supabase.from('pending_registrations').delete().eq('id', pending.id)

    res.json({ success: true, message: 'Akun berhasil diverifikasi.' })

  } catch (error) {
    console.error("Verify Error:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// --- LOGIN CHECK ---
app.post('/api/auth/login-check', async (req, res) => {
  try {
    const { email, password } = req.body

    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single()
    
    if (error || !user) return res.status(400).json({ success: false, error: "Email belum terdaftar." })

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return res.status(400).json({ success: false, error: "Password salah." })

    const code = Math.floor(1000 + Math.random() * 9000).toString()
    await supabase.from('verification_codes').upsert({ email, code }, { onConflict: 'email' })

    await sendEmail(
      email,
      'Kode OTP Masuk',
      'Kode Keamanan',
      'Gunakan kode di bawah ini untuk masuk ke akun Anda.',
      null,
      code
    )

    res.json({ success: true, message: 'OTP dikirim' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Server Error" })
  }
})

// --- VERIFY OTP ---
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body
    
    const { data, error } = await supabase.from('verification_codes').select('*').eq('email', email).eq('code', code).single()
    if (error || !data) return res.status(400).json({ success: false, error: "Kode OTP Salah." })

    await supabase.from('verification_codes').delete().eq('email', email)
    res.json({ success: true })
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
    if (count >= 30) return res.status(400).json({ error: "Max Limit 30 Reached" })

    const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Email': process.env.CLOUDFLARE_EMAIL, 'X-Auth-Key': process.env.CLOUDFLARE_API_KEY },
      body: JSON.stringify({ type: recordType, name: subdomain, content: target, ttl: 1, proxied: true })
    })
    const cfData = await cfResponse.json()
    if (!cfData.success) throw new Error(cfData.errors[0]?.message || 'Cloudflare Error')

    await supabase.from('subdomains').insert({ user_id: user.id, name: `${subdomain}.domku.my.id`, target, type: recordType, cf_id: cfData.result.id })

    res.json({ success: true, data: cfData.result })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default app
