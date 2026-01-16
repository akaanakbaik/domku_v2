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

// --- PROFESSIONAL HTML EMAIL TEMPLATE ---
const sendEmail = async (to, subject, title, message, buttonText, buttonLink) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f3f4f6; padding-bottom: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background-color: #111827; padding: 25px; text-align: center; }
        .logo { width: 180px; height: auto; object-fit: contain; }
        .body { padding: 40px 30px; color: #374151; line-height: 1.6; }
        .h1 { font-size: 22px; font-weight: bold; color: #111827; margin-bottom: 20px; }
        .text { font-size: 16px; margin-bottom: 25px; color: #4b5563; }
        .btn-container { text-align: center; margin: 30px 0; }
        .btn { background-color: #2563eb; color: #ffffff !important; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2); }
        .otp-container { background-color: #eff6ff; border: 1px dashed #bfdbfe; border-radius: 8px; padding: 15px; text-align: center; margin: 25px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 5px; font-family: monospace; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
        .link-alt { font-size: 12px; color: #9ca3af; margin-top: 20px; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="main">
          <div class="header">
            <img src="https://raw.githubusercontent.com/akaanakbaik/my-cdn/main/logodomku_nobg.png" alt="Domku" class="logo">
          </div>
          <div class="body">
            <div class="h1">${title}</div>
            <div class="text">${message}</div>
            
            ${buttonText ? `
              <div class="btn-container">
                <a href="${buttonLink}" class="btn">${buttonText}</a>
              </div>
              <div class="link-alt">Jika tombol tidak berfungsi, salin link ini:<br>${buttonLink}</div>
            ` : ''}

            ${!buttonText && buttonLink ? `
              <div class="otp-container">
                <div class="otp-code">${buttonLink}</div>
              </div>
            ` : ''}
            
            <div class="text" style="margin-top: 30px; font-size: 14px;">
              Jika Anda tidak merasa melakukan permintaan ini, harap abaikan email ini.
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Domku Manager. <br>
            Padang, Indonesia 🇮🇩
          </div>
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

app.get('/api', (req, res) => res.status(200).json({ status: 'Online' }))

// --- REGISTER ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, origin } = req.body

    if (!name || !email || !password) return res.status(400).json({ success: false, error: "Data wajib diisi." })
    if (!NAME_REGEX.test(name)) return res.status(400).json({ success: false, error: "Format nama salah." })
    if (password.length < 6) return res.status(400).json({ success: false, error: "Password min 6 karakter." })

    const { data: { users } } = await supabase.auth.admin.listUsers()
    if (users.find(u => u.email === email)) return res.status(400).json({ success: false, error: "Email sudah terdaftar." })

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    const token = crypto.randomBytes(32).toString('hex')

    const { error: dbError } = await supabase
      .from('pending_registrations')
      .upsert({ name, email, password_hash: passwordHash, token, created_at: new Date() }, { onConflict: 'email' })

    if (dbError) throw new Error(dbError.message)

    await sendEmail(
      email,
      'Verifikasi Pendaftaran Domku',
      `Halo, ${name}!`,
      'Terima kasih telah mendaftar. Langkah terakhir untuk mengamankan akun Anda adalah memverifikasi email.',
      'Verifikasi Email Saya',
      `${origin}/verify-email?token=${token}`
    )

    res.json({ success: true, message: 'Link verifikasi dikirim.' })
  } catch (error) {
    console.error("Register Error:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// --- VERIFY EMAIL ---
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body
    const { data: pending } = await supabase.from('pending_registrations').select('*').eq('token', token).single()
    
    if (!pending) return res.status(400).json({ success: false, error: "Token expired atau tidak valid." })

    const apiKey = crypto.randomBytes(12).toString('hex')

    // Cek user hantu lagi sebelum create
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const existing = users.find(u => u.email === pending.email)
    
    let userId = existing ? existing.id : null

    if (!userId) {
       const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
        email: pending.email,
        password: "DOMKU_SECURE_" + crypto.randomBytes(8).toString('hex'),
        user_metadata: { name: pending.name, api_key: apiKey },
        email_confirm: true
      })
      if (createError) throw new Error("Gagal membuat user: " + createError.message)
      userId = authUser.user.id
    } else {
      // Update existing ghost user
      await supabase.auth.admin.updateUserById(userId, { user_metadata: { name: pending.name, api_key: apiKey }, email_confirm: true })
    }

    const { error: insertError } = await supabase.from('users').upsert({
      id: userId,
      email: pending.email,
      name: pending.name,
      api_key: apiKey,
      password_hash: pending.password_hash 
    })

    if (insertError) throw new Error("DB Error: " + insertError.message)
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
    
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single()
    if (error || !user) return res.status(400).json({ success: false, error: "Email tidak ditemukan." })

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return res.status(400).json({ success: false, error: "Password salah." })

    const code = Math.floor(1000 + Math.random() * 9000).toString()
    await supabase.from('verification_codes').upsert({ email, code }, { onConflict: 'email' })

    await sendEmail(
      email,
      'Kode OTP Masuk',
      'Kode Keamanan Login',
      'Jangan berikan kode ini kepada siapapun. Gunakan kode ini untuk mengakses Dashboard.',
      null,
      code
    )

    res.json({ success: true, message: 'OTP dikirim' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// --- VERIFY OTP ---
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body
    const { data } = await supabase.from('verification_codes').select('*').eq('email', email).eq('code', code).single()
    
    if (!data) return res.status(400).json({ success: false, error: "Kode OTP Salah." })
    
    await supabase.from('verification_codes').delete().eq('email', email)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// --- SUBDOMAIN (Sama) ---
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
