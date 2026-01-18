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

const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 2 * 1024 * 1024 } 
})

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Rate limit exceeded." }
})

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 50, 
  message: { success: false, error: "Too many login attempts." }
})

app.use(helmet())
app.use(cors({ origin: true, credentials: true })) 
app.use(express.json({ limit: '10kb' })) 
app.use(limiter)

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("FATAL: Supabase URL or Key Missing in ENV")
}

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
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
  'dev', 'root', 'ftp', 'pop', 'imap', 'status', 'api', 'app', 'dashboard', 'auth', 'login', 'domku'
]

const SUBDOMAIN_REGEX = /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/

const isPrivateIP = (ip) => {
   const parts = ip.split('.');
   if (parts.length !== 4) return false;
   if (parts[0] === '10') return true;
   if (parts[0] === '172' && parts[1] >= 16 && parts[1] <= 31) return true;
   if (parts[0] === '192' && parts[1] === '168') return true;
   if (parts[0] === '127') return true;
   return false;
}

const logActivity = async (userId, action, details, req) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      details,
      ip_address: ip
    })
  } catch (e) {
    console.error("Log failed:", e.message)
  }
}

const sendEmail = async (to, subject, title, message, buttonText, buttonLink) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><style>body{font-family:sans-serif;padding:20px}.box{max-width:500px;margin:0 auto;background:#fff;padding:20px;border:1px solid #eee;border-radius:10px}.btn{display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;margin-top:20px}.otp{font-size:24px;font-weight:bold;color:#1e40af;background:#eff6ff;padding:10px;text-align:center;border-radius:5px;margin:20px 0}</style></head>
      <body><div class="box"><h2>${title}</h2><p>${message}</p>${buttonText ? `<div style="text-align:center"><a href="${buttonLink}" class="btn">${buttonText}</a></div>` : ''}${!buttonText && buttonLink ? `<div class="otp">${buttonLink}</div>` : ''}<p style="font-size:12px;color:#888;margin-top:30px">Domku Manager Security</p></div></body></html>
    `
    await transporter.sendMail({ from: `"Domku Security" <${process.env.NODEMAILER_EMAIL}>`, to, subject, html: htmlContent })
  } catch (err) {
    console.error("Email Error:", err.message)
  }
}

app.get('/api', (req, res) => res.json({ status: 'Online', version: '6.0.0 (Full Sync)' }))
app.get('/api/status', (req, res) => res.json({ status: 'online', time: new Date() }))

// 1. CREATE SUBDOMAIN
app.post('/api/subdomain', limiter, async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key']
    if (!apiKey) return res.status(401).json({ success: false, error: "API Key required" })

    const { data: user, error: userError } = await supabase.from('users').select('id, email').eq('api_key', apiKey).single()
    if (userError || !user) return res.status(403).json({ success: false, error: "Invalid API Key" })

    const rawSubdomain = req.body.subdomain || ''
    let rawTarget = req.body.target || ''
    const recordType = req.body.recordType || 'A'

    const subdomain = xss(rawSubdomain).toLowerCase()
    
    if (recordType === 'CNAME') {
        rawTarget = rawTarget.replace(/^https?:\/\//i, '')
        rawTarget = rawTarget.replace(/\/+$/, '')
    }

    const target = xss(rawTarget)

    if (!subdomain || !target) return res.status(400).json({ success: false, error: "Subdomain & Target wajib diisi" })
    if (!SUBDOMAIN_REGEX.test(subdomain)) return res.status(400).json({ success: false, error: "Format nama salah (Huruf, Angka, Titik, Strip)" })
    if (BANNED_SUBDOMAINS.includes(subdomain)) return res.status(400).json({ success: false, error: "Nama subdomain dilarang" })
    if (subdomain.length < 3 || subdomain.length > 63) return res.status(400).json({ success: false, error: "Panjang nama 3-63 karakter" })

    if ((recordType === 'A' || recordType === 'AAAA') && isPrivateIP(target)) {
        return res.status(400).json({ success: false, error: "IP Private (Lokal) tidak diizinkan. Gunakan Public IP." })
    }

    const { count } = await supabase.from('subdomains').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if (count >= 30) return res.status(400).json({ success: false, error: "Limit Max 30 Subdomain" })

    const cfHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}`
    }

    const zoneId = process.env.CLOUDFLARE_ZONE_ID
    if (!zoneId) throw new Error("Missing Cloudflare Zone ID")

    const checkUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${subdomain}.domku.my.id`
    
    const checkCf = await fetch(checkUrl, { headers: cfHeaders })
    const checkData = await checkCf.json()

    if (checkData.result && checkData.result.length > 0) {
      return res.status(400).json({ success: false, error: "Subdomain sudah digunakan" })
    }

    const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      method: 'POST',
      headers: cfHeaders,
      body: JSON.stringify({ type: recordType, name: subdomain, content: target, ttl: 1, proxied: false })
    })
    
    const cfData = await cfResponse.json()
    
    if (!cfData.success) {
      const errMsg = cfData.errors?.[0]?.message || JSON.stringify(cfData.errors) || 'Cloudflare Creation Failed'
      if (errMsg.includes("private IP") || errMsg.includes("1004")) {
          return res.status(400).json({ success: false, error: "Cloudflare menolak IP Lokal. Gunakan IP Public." })
      }
      throw new Error(errMsg)
    }

    await supabase.from('subdomains').insert({ 
        user_id: user.id, 
        name: `${subdomain}.domku.my.id`, 
        target, 
        type: recordType, 
        cf_id: cfData.result?.id || 'unknown'
    })
    
    await logActivity(user.id, 'CREATE_SUBDOMAIN', `Created ${subdomain}.domku.my.id -> ${target}`, req)

    res.json({ success: true, data: cfData.result })

  } catch (error) {
    console.error("Subdomain Error:", error)
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" })
  }
})

// 2. DELETE SUBDOMAIN (NEW FEATURE)
app.delete('/api/subdomain/:id', limiter, async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key']
    const subId = req.params.id
    
    if (!apiKey) return res.status(401).json({ success: false, error: "API Key required" })

    // Cek User
    const { data: user, error: userError } = await supabase.from('users').select('id').eq('api_key', apiKey).single()
    if (userError || !user) return res.status(403).json({ success: false, error: "Invalid API Key" })

    // Cek Subdomain di DB (Pastikan milik user ini)
    const { data: subData, error: subDataError } = await supabase.from('subdomains').select('*').eq('id', subId).eq('user_id', user.id).single()
    
    if (subDataError || !subData) {
        return res.status(404).json({ success: false, error: "Subdomain tidak ditemukan atau bukan milik Anda" })
    }

    // Hapus di Cloudflare
    if (subData.cf_id && subData.cf_id !== 'unknown') {
        const zoneId = process.env.CLOUDFLARE_ZONE_ID
        const cfHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}`
        }
        
        await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${subData.cf_id}`, {
            method: 'DELETE',
            headers: cfHeaders
        })
    }

    // Hapus di DB
    await supabase.from('subdomains').delete().eq('id', subId)
    
    await logActivity(user.id, 'DELETE_SUBDOMAIN', `Deleted ${subData.name}`, req)

    res.json({ success: true, message: "Subdomain deleted successfully" })

  } catch (error) {
    console.error("Delete Error:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// AUTH ROUTES
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const name = xss(req.body.name || '')
    const email = xss(req.body.email || '')
    const password = req.body.password || ''
    const origin = req.body.origin || ''

    if (!name || !email || !password) return res.status(400).json({ success: false, error: "Data incomplete" })
    
    const { data: userList } = await supabase.auth.admin.listUsers()
    const users = userList?.users || []
    
    if (users.find(u => u.email === email)) return res.status(400).json({ success: false, error: "Email already registered" })

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    const token = crypto.randomBytes(32).toString('hex')

    const { error: dbError } = await supabase.from('pending_registrations').upsert({ name, email, password_hash: passwordHash, token }, { onConflict: 'email' })
    if (dbError) throw new Error(dbError.message)

    await sendEmail(email, 'Verifikasi Akun', 'Verifikasi Pendaftaran', 'Klik link berikut:', 'Verifikasi', `${origin}/verify-email?token=${token}`)
    
    res.json({ success: true, message: 'Email verifikasi terkirim.' })
  } catch (error) {
    console.error("Register Error:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/auth/verify-email', authLimiter, async (req, res) => {
  try {
    const { token } = req.body
    const { data: pending } = await supabase.from('pending_registrations').select('*').eq('token', token).single()
    if (!pending) return res.status(400).json({ success: false, error: "Token invalid or expired" })

    const apiKey = crypto.randomBytes(24).toString('hex')
    let userId

    const { data: userList } = await supabase.auth.admin.listUsers()
    const users = userList?.users || []
    const existing = users.find(u => u.email === pending.email)

    if (existing) {
      userId = existing.id
      await supabase.auth.admin.updateUserById(userId, { user_metadata: { name: pending.name, api_key: apiKey }, email_confirm: true })
    } else {
      const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
        email: pending.email,
        password: "SECURE_" + crypto.randomBytes(12).toString('hex'),
        user_metadata: { name: pending.name, api_key: apiKey },
        email_confirm: true
      })
      if (createError) throw new Error(createError.message)
      userId = authUser.user.id
    }

    await supabase.from('users').upsert({ id: userId, email: pending.email, name: pending.name, api_key: apiKey, password_hash: pending.password_hash })
    await supabase.from('pending_registrations').delete().eq('id', pending.id)
    await logActivity(userId, 'REGISTER', 'Account Verified', req)

    res.json({ success: true, message: 'Account Verified.' })
  } catch (error) {
    console.error("Verify Error:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/auth/login-check', authLimiter, async (req, res) => {
  try {
    const email = xss(req.body.email || '')
    const password = req.body.password || ''

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    if (!user) return res.status(400).json({ success: false, error: "User not found" })

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return res.status(400).json({ success: false, error: "Wrong password" })

    const code = Math.floor(1000 + Math.random() * 9000).toString()
    await supabase.from('verification_codes').upsert({ email, code }, { onConflict: 'email' })
    await sendEmail(email, 'Login OTP', 'Login Access Code', 'Your OTP is:', null, code)

    res.json({ success: true, message: 'OTP Sent' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/auth/verify-otp', authLimiter, async (req, res) => {
  try {
    const { email, code } = req.body
    const { data: otp } = await supabase.from('verification_codes').select('*').eq('email', email).eq('code', code).single()
    if (!otp) return res.status(400).json({ success: false, error: "Invalid OTP" })

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    await supabase.from('verification_codes').delete().eq('email', email)
    await logActivity(user.id, 'LOGIN', 'Login Success', req)

    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/user/update-profile', upload.single('avatar'), async (req, res) => {
  try {
    const email = xss(req.body.email || '')
    const name = xss(req.body.name || '')
    const bio = xss(req.body.bio || '')
    const phone = xss(req.body.phone || '')
    const file = req.file

    let avatarUrl = null
    if (file) {
      const fileName = `${crypto.randomUUID()}_${file.originalname.replace(/[^a-zA-Z0-9.]/g, '')}`
      await supabase.storage.from('avatars').upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true })
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      avatarUrl = data.publicUrl
    }

    const updateData = { name, bio, phone }
    if (avatarUrl) updateData.avatar_url = avatarUrl

    await supabase.from('users').update(updateData).eq('email', email)
    const { data: updatedUser } = await supabase.from('users').select('*').eq('email', email).single()
    await logActivity(updatedUser.id, 'UPDATE_PROFILE', 'Profile updated', req)

    res.json({ success: true, user: updatedUser })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.post('/api/user/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    if (!await bcrypt.compare(oldPassword, user.password_hash)) return res.status(400).json({ success: false, error: "Wrong password" })
    
    const newHash = await bcrypt.hash(newPassword, 10)
    await supabase.from('users').update({ password_hash: newHash }).eq('email', email)
    await logActivity(user.id, 'CHANGE_PASSWORD', 'Success', req)
    
    res.json({ success: true, message: 'Changed' })
  } catch (e) { res.status(500).json({success: false, error: e.message}) }
})

app.post('/api/user/reset-password-request', async (req, res) => {
  try {
    const { email } = req.body
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    if(!user) return res.status(400).json({success:false, error:"User not found"})
    
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    await supabase.from('verification_codes').upsert({email, code}, {onConflict: 'email'})
    await sendEmail(email, 'Reset Password', 'Reset Code', 'Code:', null, code)
    
    res.json({success:true})
  } catch (e) { res.status(500).json({success:false, error: e.message}) }
})

app.post('/api/user/reset-password-confirm', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body
    const { data } = await supabase.from('verification_codes').select('*').eq('email', email).eq('code', code).single()
    if(!data) return res.status(400).json({success:false, error:"Invalid Code"})
    
    const newHash = await bcrypt.hash(newPassword, 10)
    await supabase.from('users').update({password_hash: newHash}).eq('email', email)
    await supabase.from('verification_codes').delete().eq('email', email)
    
    res.json({success:true})
  } catch (e) { res.status(500).json({success:false, error: e.message}) }
})

app.get('/api/lookup-ip', async (req, res) => {
    try {
        const lookup = await fetch(`http://ip-api.com/json/${req.query.ip || ''}`)
        const data = await lookup.json()
        res.json({ country: data.country || 'Unknown', city: data.city || 'Unknown', isp: data.isp })
    } catch { res.json({ country: 'Unknown' }) }
})

export default app
