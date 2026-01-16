import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
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
  res.setHeader('Content-Type', 'application/json')
  res.json({ status: 'Online', system: 'Domku V2' })
})

app.post('/api/auth/register', async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  try {
    const { name, email, password, origin } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Semua data wajib diisi." })
    }

    if (!NAME_REGEX.test(name)) {
      return res.status(400).json({ success: false, error: "Nama hanya boleh huruf, angka, dan simbol # - ! _" })
    }

    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) throw listError
    
    const isRegistered = existingUsers.users.find(u => u.email === email)
    if (isRegistered) {
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
        password_hash: password, 
        token,
        created_at: new Date()
      }, { onConflict: 'email' })

    if (dbError) throw new Error("Database Error: " + dbError.message)

    const verifyLink = `${origin}/verify-email?token=${token}`
    
    await transporter.sendMail({
      from: `Domku Team <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: 'Konfirmasi Pendaftaran Domku',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #2563eb;">Verifikasi Akun</h2>
          <p>Halo <strong>${name}</strong>,</p>
          <p>Klik tombol di bawah untuk mengaktifkan akun Anda:</p>
          <a href="${verifyLink}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verifikasi Email</a>
          <p style="margin-top:20px; font-size:12px; color:#666;">Link: ${verifyLink}</p>
        </div>
      `
    })

    res.json({ success: true, message: 'Link verifikasi dikirim ke email.' })

  } catch (error) {
    console.error("Register Error:", error)
    res.status(500).json({ success: false, error: error.message || "Terjadi kesalahan server" })
  }
})

app.post('/api/auth/verify-email', async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  try {
    const { token } = req.body

    const { data: pending, error } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !pending) {
      return res.status(400).json({ success: false, error: "Token tidak valid atau kadaluarsa." })
    }

    const generateApiKey = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
      return Array.from({length: 12}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    }
    const apiKey = generateApiKey()

    const { data: userAuth, error: createError } = await supabase.auth.admin.createUser({
      email: pending.email,
      password: pending.password_hash,
      user_metadata: { name: pending.name, api_key: apiKey },
      email_confirm: true
    })

    if (createError) throw createError

    await supabase.from('users').insert({
      id: userAuth.user.id,
      email: pending.email,
      name: pending.name,
      api_key: apiKey
    })

    await supabase.from('pending_registrations').delete().eq('id', pending.id)

    res.json({ success: true, message: 'Akun aktif. Silakan login.' })

  } catch (error) {
    console.error("Verify Error:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/auth/login-otp', async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  try {
    const { email } = req.body
    const code = Math.floor(1000 + Math.random() * 9000).toString()

    const { error } = await supabase
      .from('verification_codes')
      .upsert({ email, code, created_at: new Date() }, { onConflict: 'email' })

    if (error) throw error

    await transporter.sendMail({
      from: `Domku Security <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: 'Kode OTP Login',
      html: `<h3>Kode OTP: <b>${code}</b></h3><p>Jangan berikan kode ini kepada siapapun.</p>`
    })

    res.json({ success: true, message: 'OTP terkirim' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/auth/verify-otp', async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  try {
    const { email, code } = req.body
    
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .single()

    if (error || !data) {
      return res.status(400).json({ success: false, error: 'Kode OTP Salah!' })
    }

    await supabase.from('verification_codes').delete().eq('email', email)

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/subdomain', async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  const apiKey = req.headers['x-api-key']
  
  if (!apiKey) {
    return res.status(401).json({ author: "Aka", success: false, error: "API Key diperlukan" })
  }

  const { data: user } = await supabase.from('users').select('*').eq('api_key', apiKey).single()
  if (!user) {
    return res.status(403).json({ author: "Aka", success: false, error: "API Key tidak valid" })
  }

  try {
    const { subdomain, recordType, target } = req.body
    if (!subdomain || !recordType || !target) {
      return res.status(400).json({ author: "Aka", success: false, error: "Data tidak lengkap" })
    }

    const { count } = await supabase.from('subdomains').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if (count >= 30) {
      return res.status(400).json({ author: "Aka", success: false, error: "Limit Max 30 Subdomain" })
    }

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
