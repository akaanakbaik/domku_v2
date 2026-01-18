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

const getHtmlTemplate = (title, bodyContent, buttonText = null, buttonUrl = null, footerNote = '') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', sans-serif; background-color: #f4f4f9; margin: 0; padding: 0; }
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
          ${buttonUrl ? `<p style="font-size:12px; color:#94a3b8; margin-top:20px; word-break:break-all;">Jika tombol tidak berfungsi, salin link ini: <br>${buttonUrl}</p>` : ''}
        </div>
        <div class="footer"><p>${footerNote}</p><p>&copy; 2026 Domku Manager V2.1</p></div>
      </div>
    </body>
    </html>
  `
}

app.get('/api', (req, res) => res.json({ status: 'Online', version: '2.1.0' }))

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
    const html = getHtmlTemplate('Verifikasi Email', `<p>Halo <b>${name}</b>,</p><p>Klik tombol di bawah untuk mengaktifkan akun.</p>`, 'Verifikasi Sekarang', verifyUrl)
    await transporter.sendMail({ from: `"Domku Security" <${process.env.NODEMAILER_EMAIL}>`, to: email, subject: 'Aktivasi Akun', html })

    res.json({ success: true, message: 'Link verifikasi dikirim ke email.' })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token, email } = req.body
    const { data: tokenData } = await supabase.from('auth_tokens').select('*').eq('token', token).eq('type', 'VERIFY_EMAIL').single()
    
    if (!tokenData) return res.status(400).json({ success: false, error: "Link invalid." })
    if (new Date(tokenData.expires_at) < new Date()) return res.status(400).json({ success: false, error: "Link expired." })

    const { data: pending } = await supabase.from('pending_registrations').select('*').eq('email', email).single()
    if (!pending) return res.status(400).json({ success: false, error: "Data hilang." })

    const apiKey = crypto.randomBytes(24).toString('hex')
    const { data: authUser } = await supabase.auth.admin.createUser({
      email: pending.email,
      password: "SECURE_" + crypto.randomBytes(12).toString('hex'),
      user_metadata: { name: pending.name, api_key: apiKey },
      email_confirm: true
    })
    
    await supabase.from('users').upsert({ id: authUser.user.id, email: pending.email, name: pending.name, api_key: apiKey, password_hash: pending.password_hash })
    await supabase.from('pending_registrations').delete().eq('email', email)
    await supabase.from('auth_tokens').delete().eq('token', token)

    res.json({ success: true, message: 'Akun aktif.' })
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
    const html = getHtmlTemplate('Reset Password', `<p>Halo <b>${user.name}</b>,</p><p>Klik tombol di bawah untuk reset password.</p>`, 'Ubah Password', resetUrl)
    await transporter.sendMail({ from: `"Domku Security" <${process.env.NODEMAILER_EMAIL}>`, to: email, subject: 'Reset Password', html })

    res.json({ success: true, message: 'Link reset dikirim.' })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body
    const { data: tokenData } = await supabase.from('auth_tokens').select('*').eq('token', token).eq('type', 'RESET_PASSWORD').single()
    
    if (!tokenData) return res.status(400).json({ success: false, error: "Link invalid." })
    if (new Date(tokenData.expires_at) < new Date()) return res.status(400).json({ success: false, error: "Link expired." })
    if (tokenData.email !== email) return res.status(400).json({ success: false, error: "Email mismatch." })

    const salt = await bcrypt.genSalt(12)
    const newHash = await bcrypt.hash(newPassword, salt)

    await supabase.from('users').update({ password_hash: newHash }).eq('email', email)
    await supabase.from('auth_tokens').delete().eq('token', token)

    res.json({ success: true, message: 'Password berhasil diubah.' })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.delete('/api/user/delete-account', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key']
    const { password } = req.body
    
    if (!apiKey || !password) return res.status(400).json({success: false, error: "Auth required"})

    const { data: user } = await supabase.from('users').select('*').eq('api_key', apiKey).single()
    if(!user) return res.status(403).json({success: false, error: "User not found"})

    const isValid = await bcrypt.compare(password, user.password_hash)
    if(!isValid) return res.status(403).json({success: false, error: "Password salah"})

    // 1. Delete all Cloudflare Records
    const { data: subdomains } = await supabase.from('subdomains').select('cf_id').eq('user_id', user.id)
    if(subdomains && subdomains.length > 0) {
        const zoneId = process.env.CLOUDFLARE_ZONE_ID
        const cfHeaders = { 'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}`, 'Content-Type': 'application/json' }
        
        // Loop delete (Promise.all for speed)
        await Promise.all(subdomains.map(async (sub) => {
            if(sub.cf_id && sub.cf_id !== 'unknown') {
                await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${sub.cf_id}`, { method: 'DELETE', headers: cfHeaders })
            }
        }))
    }

    // 2. Cascade Delete in DB (Subdomains & Logs delete auto via DB Cascade if set, but we manual delete to be safe)
    await supabase.from('subdomains').delete().eq('user_id', user.id)
    await supabase.from('activity_logs').delete().eq('user_id', user.id)
    await supabase.from('auth_tokens').delete().eq('email', user.email)
    
    // 3. Delete Auth User & Table User
    await supabase.auth.admin.deleteUser(user.id)
    await supabase.from('users').delete().eq('id', user.id)

    res.json({success: true, message: "Akun permanen dihapus."})
  } catch (e) { res.status(500).json({success: false, error: e.message}) }
})

// ... (Simpan route login, contact, subdomain create/delete seperti sebelumnya) ...
export default app
