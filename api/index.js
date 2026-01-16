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

const NAME_REGEX = /^[a-zA-Z0-9#!_-]+$/

app.get('/api', (req, res) => {
  res.status(200).json({ status: 'Online', system: 'Domku V3 Secure' })
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, origin } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Semua data wajib diisi." })
    }

    if (!NAME_REGEX.test(name)) {
      return res.status(400).json({ success: false, error: "Nama mengandung karakter terlarang." })
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password minimal 6 karakter." })
    }

    const { data: userCheck, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (userCheck) {
      return res.status(400).json({ success: false, error: "Email sudah terdaftar." })
    }

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

    if (dbError) throw new Error("Gagal menyimpan data sementara: " + dbError.message)

    const verifyLink = `${origin}/verify-email?token=${token}`
    
    await transporter.sendMail({
      from: `Domku <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: 'Verifikasi Pendaftaran Domku',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #2563eb;">Konfirmasi Akun</h2>
          <p>Halo <strong>${name}</strong>,</p>
          <p>Terima kasih telah mendaftar. Klik tombol di bawah ini untuk mengaktifkan akun Anda:</p>
          <a href="${verifyLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verifikasi Email</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">Jika tombol tidak berfungsi, salin link ini: <br/> ${verifyLink}</p>
        </div>
      `
    })

    res.json({ success: true, message: 'Link verifikasi telah dikirim ke email Anda.' })

  } catch (error) {
    console.error("Register Error:", error)
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" })
  }
})

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body

    const { data: pending, error } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !pending) {
      return res.status(400).json({ success: false, error: "Link tidak valid atau kadaluarsa." })
    }

    const generateApiKey = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
      return Array.from({length: 12}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    }
    const apiKey = generateApiKey()

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: pending.email,
      password: 'TEMP_PASSWORD_' + crypto.randomBytes(8).toString('hex'), 
      user_metadata: { name: pending.name, api_key: apiKey },
      email_confirm: true
    })

    if (authError) throw new Error("Gagal membuat user Auth: " + authError.message)

    const { error: insertError } = await supabase.from('users').insert({
      id: authUser.user.id,
      email: pending.email,
      name: pending.name,
      api_key: apiKey,
      password_hash: pending.password_hash 
    })

    if (insertError) throw new Error("Gagal menyimpan profil user: " + insertError.message)

    await supabase.from('pending_registrations').delete().eq('id', pending.id)

    res.json({ success: true, message: 'Akun berhasil diaktifkan. Silakan login.' })

  } catch (error) {
    console.error("Verification Error:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/auth/login-check', async (req, res) => {
  try {
    const { email, password } = req.body

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(400).json({ success: false, error: "Email tidak ditemukan." })
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return res.status(400).json({ success: false, error: "Password salah." })
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString()

    const { error: otpError } = await supabase
      .from('verification_codes')
      .upsert({ email, code, created_at: new Date() }, { onConflict: 'email' })

    if (otpError) throw otpError

    await transporter.sendMail({
      from: `Domku Security <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: 'Kode OTP Login',
      html: `<div style="text-align:center;"><h2>Kode OTP Login</h2><h1 style="letter-spacing:5px; color:#2563eb;">${code}</h1><p>Jangan berikan kode ini kepada siapapun.</p></div>`
    })

    res.json({ success: true, message: 'OTP dikirim' })

  } catch (error) {
    console.error("Login Check Error:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body
    
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .single()

    if (error || !data) {
      return res.status(400).json({ success: false, error: "Kode OTP Salah." })
    }

    const { data: user } = await supabase.from('users').select('id, email, password_hash').eq('email', email).single()
    
    // Hapus OTP
    await supabase.from('verification_codes').delete().eq('email', email)

    res.json({ success: true, userId: user.id, userEmail: user.email })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/subdomain', async (req, res) => {
  const apiKey = req.headers['x-api-key']
  if (!apiKey) return res.status(401).json({ author: "Aka", success: false, error: "API Key diperlukan" })
  
  const { data: user } = await supabase.from('users').select('*').eq('api_key', apiKey).single()
  if (!user) return res.status(403).json({ author: "Aka", success: false, error: "API Key tidak valid" })

  try {
    const { subdomain, recordType, target } = req.body
    if (!subdomain || !recordType || !target) return res.status(400).json({ error: "Data tidak lengkap" })

    const { count } = await supabase.from('subdomains').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if (count >= 30) return res.status(400).json({ error: "Limit Max 30 Subdomain" })

    const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Email': process.env.CLOUDFLARE_EMAIL,
        'X-Auth-Key': process.env.CLOUDFLARE_API_KEY
      },
      body: JSON.stringify({ type: recordType, name: subdomain, content: target, ttl: 1, proxied: true })
    })
    const cfData = await cfResponse.json()
    if (!cfData.success) throw new Error(cfData.errors[0]?.message || 'CF Error')

    await supabase.from('subdomains').insert({
      user_id: user.id,
      name: `${subdomain}.domku.my.id`,
      target, type: recordType, cf_id: cfData.result.id
    })

    res.json({ author: "Aka", success: true, data: cfData.result })
  } catch (error) {
    res.status(500).json({ author: "Aka", success: false, error: error.message })
  }
})

export default app
