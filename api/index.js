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
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

app.use(helmet())
app.use(cors({ origin: true, credentials: true })) 
app.use(express.json({ limit: '10kb' })) 

const limiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 100 })
app.use(limiter)

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.NODEMAILER_EMAIL, pass: process.env.NODEMAILER_PASSWORD }
})

const BANNED_SUBDOMAINS = ['www', 'mail', 'remote', 'blog', 'webmail', 'server', 'ns1', 'ns2', 'smtp', 'secure', 'vpn', 'm', 'shop', 'admin', 'panel', 'cpanel', 'whm', 'billing', 'support', 'test', 'dev', 'root', 'ftp', 'pop', 'imap', 'status', 'api', 'app', 'dashboard', 'auth', 'login', 'domku']
const SUBDOMAIN_REGEX = /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/

const getHtmlTemplate = (title, bodyContent, buttonText = null, buttonUrl = null, footerNote = '') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: #0f172a; padding: 30px; text-align: center; }
        .header h1 { color: #3b82f6; margin: 0; font-size: 24px; letter-spacing: 2px; }
        .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
        .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; box-shadow: 0 4px 6px rgba(37,99,235,0.2); }
        .btn:hover { background: #1d4ed8; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>DOMKU MANAGER</h1></div>
        <div class="content">
          <h2 style="color:#1e293b; margin-top:0;">${title}</h2>
          ${bodyContent}
          ${buttonText ? `<div style="text-align:center;"><a href="${buttonUrl}" class="btn">${buttonText}</a></div>` : ''}
          ${buttonUrl && !buttonText ? `<p style="word-break:break-all; font-size:12px; color:#64748b; margin-top:20px;">Link: ${buttonUrl}</p>` : ''}
        </div>
        <div class="footer">
          <p>${footerNote}</p>
          <p>&copy; 2026 Domku Manager v2.0</p>
        </div>
      </div>
    </body>
    </html>
  `
}

app.get('/api', (req, res) => res.json({ status: 'Online', version: '2.0.0' }))

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, origin } = req.body
    if (!name || !email || !password) return res.status(400).json({ success: false, error: "Data incomplete" })

    const { data: userList } = await supabase.auth.admin.listUsers()
    if (userList?.users?.find(u => u.email === email)) return res.status(400).json({ success: false, error: "Email sudah terdaftar" })

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 10 * 60000)

    await supabase.from('pending_registrations').upsert({ name, email, password_hash: passwordHash }, { onConflict: 'email' })
    await supabase.from('auth_tokens').insert({ email, token, type: 'VERIFY_EMAIL', expires_at: expiresAt })

    const verifyUrl = `${origin}/verify-email?token=${token}&email=${email}`
    const html = getHtmlTemplate(
      'Verifikasi Email', 
      `<p>Halo <b>${name}</b>,</p><p>Terima kasih telah mendaftar. Silakan klik tombol di bawah untuk mengaktifkan akun Anda. Link ini berlaku selama 10 menit.</p>`, 
      'Verifikasi Sekarang', 
      verifyUrl
    )
    await transporter.sendMail({ from: `"Domku Security" <${process.env.NODEMAILER_EMAIL}>`, to: email, subject: 'Aktivasi Akun Domku', html })

    res.json({ success: true, message: 'Link verifikasi dikirim ke email.' })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.post('/api/auth/resend-verify', async (req, res) => {
  try {
    const { email, origin } = req.body
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 10 * 60000)

    await supabase.from('auth_tokens').delete().eq('email', email).eq('type', 'VERIFY_EMAIL')
    await supabase.from('auth_tokens').insert({ email, token, type: 'VERIFY_EMAIL', expires_at: expiresAt })

    const verifyUrl = `${origin}/verify-email?token=${token}&email=${email}`
    const html = getHtmlTemplate('Verifikasi Ulang', '<p>Anda meminta link verifikasi baru.</p>', 'Verifikasi Sekarang', verifyUrl)
    await transporter.sendMail({ from: `"Domku Security" <${process.env.NODEMAILER_EMAIL}>`, to: email, subject: 'Link Verifikasi Baru', html })

    res.json({ success: true, message: 'Link baru dikirim.' })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token, email } = req.body
    const { data: tokenData } = await supabase.from('auth_tokens').select('*').eq('token', token).eq('type', 'VERIFY_EMAIL').single()
    
    if (!tokenData) return res.status(400).json({ success: false, error: "Link tidak valid atau sudah digunakan." })
    if (new Date(tokenData.expires_at) < new Date()) return res.status(400).json({ success: false, error: "Link kadaluarsa (Expired)." })

    const { data: pending } = await supabase.from('pending_registrations').select('*').eq('email', email).single()
    if (!pending) return res.status(400).json({ success: false, error: "Data pendaftaran tidak ditemukan." })

    const apiKey = crypto.randomBytes(24).toString('hex')
    const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
      email: pending.email,
      password: "SECURE_" + crypto.randomBytes(12).toString('hex'),
      user_metadata: { name: pending.name, api_key: apiKey },
      email_confirm: true
    })
    
    if (createError) throw new Error(createError.message)

    await supabase.from('users').upsert({ id: authUser.user.id, email: pending.email, name: pending.name, api_key: apiKey, password_hash: pending.password_hash })
    await supabase.from('pending_registrations').delete().eq('email', email)
    await supabase.from('auth_tokens').delete().eq('token', token)

    res.json({ success: true, message: 'Akun aktif! Silakan login.' })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email, origin } = req.body
    const { data: user } = await supabase.from('users').select('id, name').eq('email', email).single()
    
    if (!user) return res.status(404).json({ success: false, error: "Email tidak terdaftar." })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 10 * 60000)

    await supabase.from('auth_tokens').delete().eq('email', email).eq('type', 'RESET_PASSWORD')
    await supabase.from('auth_tokens').insert({ email, token, type: 'RESET_PASSWORD', expires_at: expiresAt })

    const resetUrl = `${origin}/reset-password?token=${token}&email=${email}`
    const html = getHtmlTemplate(
      'Reset Kata Sandi', 
      `<p>Halo <b>${user.name}</b>,</p><p>Kami menerima permintaan untuk mereset kata sandi. Klik tombol di bawah untuk melanjutkan.</p>`, 
      'Ubah Kata Sandi', 
      resetUrl,
      'Jika Anda tidak meminta ini, abaikan saja.'
    )
    
    await transporter.sendMail({ from: `"Domku Security" <${process.env.NODEMAILER_EMAIL}>`, to: email, subject: 'Permintaan Reset Password', html })

    res.json({ success: true, message: 'Cek email untuk ubah sandi.' })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body
    const { data: tokenData } = await supabase.from('auth_tokens').select('*').eq('token', token).eq('type', 'RESET_PASSWORD').single()
    
    if (!tokenData) return res.status(400).json({ success: false, error: "Link tidak valid / sudah dipakai." })
    if (new Date(tokenData.expires_at) < new Date()) return res.status(400).json({ success: false, error: "Link kadaluarsa (10 menit)." })
    if (tokenData.email !== email) return res.status(400).json({ success: false, error: "Email tidak cocok." })

    const salt = await bcrypt.genSalt(12)
    const newHash = await bcrypt.hash(newPassword, salt)

    await supabase.from('users').update({ password_hash: newHash }).eq('email', email)
    await supabase.from('auth_tokens').delete().eq('token', token)

    res.json({ success: true, message: 'Password berhasil diubah.' })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.post('/api/auth/login-check', async (req, res) => {
  try {
    const { email, password } = req.body
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    if (!user) return res.status(400).json({ success: false, error: "User not found" })

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return res.status(400).json({ success: false, error: "Wrong password" })

    const code = Math.floor(1000 + Math.random() * 9000).toString()
    await supabase.from('verification_codes').upsert({ email, code }, { onConflict: 'email' })
    
    const html = getHtmlTemplate('Kode Masuk', `<p>Gunakan kode berikut untuk masuk:</p><h1 style="text-align:center; font-size:32px; letter-spacing:5px;">${code}</h1>`, null, null, 'Jangan berikan kode ini kepada siapapun.')
    await transporter.sendMail({ from: `"Domku Auth" <${process.env.NODEMAILER_EMAIL}>`, to: email, subject: 'Login OTP', html })

    res.json({ success: true, message: 'OTP Sent' })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, code } = req.body
    const { data: otp } = await supabase.from('verification_codes').select('*').eq('email', email).eq('code', code).single()
    if (!otp) return res.status(400).json({ success: false, error: "Invalid OTP" })

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    await supabase.from('verification_codes').delete().eq('email', email)
    res.json({ success: true, user })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.post('/api/contact/send', upload.single('image'), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body
    const file = req.file

    const attachments = []
    if (file) {
      attachments.push({ filename: file.originalname, content: file.buffer })
    }

    const htmlContent = `
      <div style="font-family: sans-serif; color:#333;">
        <h2 style="border-bottom:2px solid #eee; padding-bottom:10px;">Laporan Aduan Baru</h2>
        <p><strong>Pengirim:</strong> ${name} (${email})</p>
        <p><strong>Judul:</strong> ${subject}</p>
        <div style="background:#f9f9f9; padding:15px; border-left:4px solid #3b82f6; margin:20px 0;">
          <p style="margin:0; white-space: pre-wrap;">${message}</p>
        </div>
        ${file ? '<p><em>*Lampiran gambar disertakan dalam email ini.</em></p>' : ''}
      </div>
    `

    await transporter.sendMail({
      from: `"Layanan Aduan" <${process.env.NODEMAILER_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `[ADUAN] ${subject}`,
      html: htmlContent,
      attachments
    })

    res.json({ success: true, message: 'Laporan berhasil dikirim.' })
  } catch (error) { res.status(500).json({ success: false, error: 'Gagal mengirim laporan.' }) }
})

export default app
