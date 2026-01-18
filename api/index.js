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
  limits: { fileSize: 5 * 1024 * 1024 } 
})

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Rate limit exceeded" }
})

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 50, 
  message: { success: false, error: "Too many auth attempts" }
})

app.use(helmet())
app.use(cors({ origin: true, credentials: true })) 
app.use(express.json({ limit: '10kb' })) 
app.use(limiter)

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
   const parts = ip.split('.')
   if (parts.length !== 4) return false
   if (parts[0] === '10') return true
   if (parts[0] === '172' && parts[1] >= 16 && parts[1] <= 31) return true
   if (parts[0] === '192' && parts[1] === '168') return true
   if (parts[0] === '127') return true
   return false
}

const logActivity = async (userId, action, details, req) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
    await supabase.from('activity_logs').insert({ user_id: userId, action, details, ip_address: ip })
  } catch (e) { console.error(e) }
}

const getHtmlTemplate = (title, bodyContent, buttonText = null, buttonUrl = null, footerNote = '') => {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:'Segoe UI',sans-serif;background-color:#f4f4f9;margin:0;padding:0}.container{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05)}.header{background:#0f172a;padding:30px;text-align:center}.header h1{color:#3b82f6;margin:0;font-size:24px;letter-spacing:2px}.content{padding:40px 30px;color:#334155;line-height:1.6}.btn{display:inline-block;background:#2563eb;color:#fff!important;padding:12px 30px;text-decoration:none;border-radius:8px;font-weight:600;margin-top:20px;box-shadow:0 4px 6px rgba(37,99,235,0.2)}.btn:hover{background:#1d4ed8}.footer{background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0}.link-break{word-break:break-all;font-size:12px;color:#94a3b8;margin-top:20px}</style></head><body><div class="container"><div class="header"><h1>DOMKU MANAGER</h1></div><div class="content"><h2 style="color:#1e293b;margin-top:0">${title}</h2>${bodyContent}${buttonText?`<div style="text-align:center"><a href="${buttonUrl}" class="btn">${buttonText}</a></div>`:''}${buttonUrl?`<p class="link-break">Link: <br>${buttonUrl}</p>`:''}</div><div class="footer"><p>${footerNote}</p><p>&copy; 2026 Domku System</p></div></div></body></html>`
}

app.get('/api', (req, res) => res.json({ status: 'Online', version: '2.4.0' }))
app.get('/api/status', (req, res) => res.json({ status: 'online', time: new Date() }))

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const name = xss(req.body.name || '')
    const rawEmail = xss(req.body.email || '')
    const password = req.body.password || ''
    const origin = req.body.origin || ''

    if (!name || !rawEmail || !password) return res.status(400).json({ success: false, error: "Data incomplete" })
    
    // FIX: Force Lowercase Email
    const email = rawEmail.toLowerCase()

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

    res.json({ success: true, message: 'Link verifikasi dikirim.' })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.post('/api/auth/verify-email', authLimiter, async (req, res) => {
  try {
    const { token } = req.body
    const emailInput = req.body.email ? req.body.email.toLowerCase() : null
    
    // 1. Cek Token
    const { data: tokenData } = await supabase.from('auth_tokens').select('*').eq('token', token).eq('type', 'VERIFY_EMAIL').single()
    
    // LOGIC FIX: Jika token tidak ada, cek apakah user sudah aktif (Handling Double Click)
    if (!tokenData) {
        if (emailInput) {
            const { data: existing } = await supabase.from('users').select('id').eq('email', emailInput).single()
            if (existing) return res.json({ success: true, message: 'Akun sudah aktif sebelumnya.' })
        }
        return res.status(400).json({ success: false, error: "Link tidak valid atau sudah digunakan." })
    }

    if (new Date(tokenData.expires_at) < new Date()) return res.status(400).json({ success: false, error: "Link kadaluarsa." })

    const email = tokenData.email.toLowerCase()
    
    // 2. Cek Data Pending
    const { data: pending } = await supabase.from('pending_registrations').select('*').eq('email', email).single()
    
    if (!pending) {
        // Fallback Check: Pending hilang tapi token ada? Cek user real.
        const { data: existing } = await supabase.from('users').select('id').eq('email', email).single()
        if (existing) {
            await supabase.from('auth_tokens').delete().eq('token', token) // Bersihkan token
            return res.json({ success: true, message: 'Akun sudah aktif.' })
        }
        return res.status(400).json({ success: false, error: "Data registrasi tidak ditemukan. Silakan daftar ulang." })
    }

    // 3. Create User
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

    res.json({ success: true, message: 'Akun berhasil diaktifkan.' })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.post('/api/auth/resend-verify', authLimiter, async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.toLowerCase() : ''
    const origin = req.body.origin

    if(!email) return res.status(400).json({success:false, error: "Email required"})

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 10 * 60000)

    // Hapus token lama untuk email ini
    await supabase.from('auth_tokens').delete().eq('email', email).eq('type', 'VERIFY_EMAIL')
    await supabase.from('auth_tokens').insert({ email, token, type: 'VERIFY_EMAIL', expires_at: expiresAt })

    const verifyUrl = `${origin}/verify-email?token=${token}&email=${email}`
    const html = getHtmlTemplate('Link Baru', '<p>Anda meminta link verifikasi baru.</p>', 'Verifikasi Sekarang', verifyUrl)
    await transporter.sendMail({ from: `"Domku Security" <${process.env.NODEMAILER_EMAIL}>`, to: email, subject: 'Link Verifikasi Baru', html })

    res.json({ success: true, message: 'Link baru dikirim.' })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.post('/api/auth/login-check', authLimiter, async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.toLowerCase() : ''
    const password = req.body.password || ''

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    if (!user) return res.status(400).json({ success: false, error: "User not found" })

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return res.status(400).json({ success: false, error: "Wrong password" })

    const code = Math.floor(1000 + Math.random() * 9000).toString()
    await supabase.from('verification_codes').upsert({ email, code }, { onConflict: 'email' })
    
    const html = getHtmlTemplate('Kode Login', `<p>Gunakan kode ini:</p><h1 style="text-align:center;letter-spacing:5px;">${code}</h1>`, null, null, 'Jangan berikan kepada siapapun.')
    await transporter.sendMail({ from: `"Domku Auth" <${process.env.NODEMAILER_EMAIL}>`, to: email, subject: 'Login OTP', html })

    res.json({ success: true, message: 'OTP Sent' })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.post('/api/auth/verify-otp', authLimiter, async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.toLowerCase() : ''
    const { code } = req.body
    
    const { data: otp } = await supabase.from('verification_codes').select('*').eq('email', email).eq('code', code).single()
    if (!otp) return res.status(400).json({ success: false, error: "Invalid OTP" })

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    await supabase.from('verification_codes').delete().eq('email', email)
    await logActivity(user.id, 'LOGIN', 'Login Success', req)

    res.json({ success: true, user })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.toLowerCase() : ''
    const origin = req.body.origin

    const { data: user } = await supabase.from('users').select('id, name').eq('email', email).single()
    if (!user) return res.status(404).json({ success: false, error: "Email tidak ditemukan." })

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

app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body
    
    const { data: tokenData } = await supabase.from('auth_tokens').select('*').eq('token', token).eq('type', 'RESET_PASSWORD').single()
    if (!tokenData) return res.status(400).json({ success: false, error: "Link invalid." })
    if (new Date(tokenData.expires_at) < new Date()) return res.status(400).json({ success: false, error: "Link expired." })

    const email = tokenData.email.toLowerCase()
    const salt = await bcrypt.genSalt(12)
    const newHash = await bcrypt.hash(newPassword, salt)

    await supabase.from('users').update({ password_hash: newHash }).eq('email', email)
    await supabase.from('auth_tokens').delete().eq('token', token)

    res.json({ success: true, message: 'Password berhasil diubah.' })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.post('/api/user/update-profile', upload.single('avatar'), async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.toLowerCase() : ''
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
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.post('/api/user/change-password', async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.toLowerCase() : ''
    const { oldPassword, newPassword } = req.body
    
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    if (!await bcrypt.compare(oldPassword, user.password_hash)) return res.status(400).json({ success: false, error: "Password lama salah" })
    
    const newHash = await bcrypt.hash(newPassword, 10)
    await supabase.from('users').update({ password_hash: newHash }).eq('email', email)
    await logActivity(user.id, 'CHANGE_PASSWORD', 'Success', req)
    
    res.json({ success: true, message: 'Password diubah' })
  } catch (e) { res.status(500).json({success: false, error: e.message}) }
})

app.delete('/api/user/delete-account', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key']
    const { password } = req.body
    
    if (!apiKey || !password) return res.status(400).json({success: false, error: "Auth required"})
    const { data: user } = await supabase.from('users').select('*').eq('api_key', apiKey).single()
    if(!user) return res.status(403).json({success: false, error: "User not found"})
    
    if(!await bcrypt.compare(password, user.password_hash)) return res.status(403).json({success: false, error: "Password salah"})

    const { data: subdomains } = await supabase.from('subdomains').select('cf_id').eq('user_id', user.id)
    if(subdomains?.length > 0) {
        const zoneId = process.env.CLOUDFLARE_ZONE_ID
        const cfHeaders = { 'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}`, 'Content-Type': 'application/json' }
        await Promise.all(subdomains.map(async (sub) => {
            if(sub.cf_id && sub.cf_id !== 'unknown') {
                await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${sub.cf_id}`, { method: 'DELETE', headers: cfHeaders })
            }
        }))
    }

    await supabase.from('subdomains').delete().eq('user_id', user.id)
    await supabase.from('activity_logs').delete().eq('user_id', user.id)
    await supabase.from('auth_tokens').delete().eq('email', user.email)
    await supabase.auth.admin.deleteUser(user.id)
    await supabase.from('users').delete().eq('id', user.id)

    res.json({success: true, message: "Account deleted"})
  } catch (e) { res.status(500).json({success: false, error: e.message}) }
})

app.post('/api/subdomain', limiter, async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key']
    if (!apiKey) return res.status(401).json({ success: false, error: "API Key required" })

    const { data: user } = await supabase.from('users').select('id').eq('api_key', apiKey).single()
    if (!user) return res.status(403).json({ success: false, error: "Invalid API Key" })

    const rawSubdomain = req.body.subdomain || ''
    let rawTarget = req.body.target || ''
    const recordType = req.body.recordType || 'A'
    const subdomain = xss(rawSubdomain).toLowerCase()
    
    if (recordType === 'CNAME') rawTarget = rawTarget.replace(/^https?:\/\//i, '').replace(/\/+$/, '')
    const target = xss(rawTarget)

    if (!subdomain || !target) return res.status(400).json({ success: false, error: "Data incomplete" })
    if (!SUBDOMAIN_REGEX.test(subdomain)) return res.status(400).json({ success: false, error: "Invalid format" })
    if (BANNED_SUBDOMAINS.includes(subdomain)) return res.status(400).json({ success: false, error: "Banned name" })
    if ((recordType === 'A' || recordType === 'AAAA') && isPrivateIP(target)) return res.status(400).json({ success: false, error: "Private IP disallowed" })

    const { count } = await supabase.from('subdomains').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if (count >= 30) return res.status(400).json({ success: false, error: "Limit reached" })

    const zoneId = process.env.CLOUDFLARE_ZONE_ID
    const cfHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}` }
    
    const checkCf = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${subdomain}.domku.my.id`, { headers: cfHeaders })
    const checkData = await checkCf.json()
    if (checkData.result && checkData.result.length > 0) return res.status(400).json({ success: false, error: "Subdomain taken" })

    const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      method: 'POST',
      headers: cfHeaders,
      body: JSON.stringify({ type: recordType, name: subdomain, content: target, ttl: 1, proxied: false })
    })
    const cfData = await cfResponse.json()
    if (!cfData.success) {
      const errMsg = cfData.errors?.[0]?.message || 'CF Error'
      if (errMsg.includes("private IP")) return res.status(400).json({ success: false, error: "CF rejected Private IP" })
      throw new Error(errMsg)
    }

    await supabase.from('subdomains').insert({ user_id: user.id, name: `${subdomain}.domku.my.id`, target, type: recordType, cf_id: cfData.result?.id })
    await logActivity(user.id, 'CREATE_SUBDOMAIN', `Created ${subdomain}.domku.my.id`, req)

    res.json({ success: true, data: cfData.result })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.delete('/api/subdomain/:id', limiter, async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key']
    const subId = req.params.id
    if (!apiKey) return res.status(401).json({ success: false, error: "API Key required" })

    const { data: user } = await supabase.from('users').select('id').eq('api_key', apiKey).single()
    if (!user) return res.status(403).json({ success: false, error: "Invalid API Key" })

    const { data: subData } = await supabase.from('subdomains').select('*').eq('id', subId).eq('user_id', user.id).single()
    if (!subData) return res.status(404).json({ success: false, error: "Not found" })

    if (subData.cf_id && subData.cf_id !== 'unknown') {
        await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records/${subData.cf_id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}` }
        })
    }

    await supabase.from('subdomains').delete().eq('id', subId)
    await logActivity(user.id, 'DELETE_SUBDOMAIN', `Deleted ${subData.name}`, req)
    res.json({ success: true })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

app.post('/api/contact/send', upload.single('image'), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body
    const file = req.file

    const attachments = []
    if (file) attachments.push({ filename: file.originalname, content: file.buffer })

    const htmlContent = `<div style="font-family:sans-serif;color:#333"><h2 style="border-bottom:2px solid #eee;padding-bottom:10px">Laporan Aduan</h2><p><strong>Dari:</strong> ${name} (${email})</p><p><strong>Hal:</strong> ${subject}</p><div style="background:#f9f9f9;padding:15px;border-left:4px solid #3b82f6;margin:20px 0"><p style="margin:0;white-space:pre-wrap">${message}</p></div>${file?'<p><em>*Ada lampiran gambar.</em></p>':''}</div>`

    await transporter.sendMail({
      from: `"Layanan Aduan" <${process.env.NODEMAILER_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `[ADUAN] ${subject}`,
      html: htmlContent,
      attachments
    })

    res.json({ success: true, message: 'Sent' })
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }) }
})

app.get('/api/lookup-ip', async (req, res) => {
    try {
        const lookup = await fetch(`http://ip-api.com/json/${req.query.ip || ''}`)
        const data = await lookup.json()
        res.json({ country: data.country || 'Unknown', city: data.city || 'Unknown', isp: data.isp })
    } catch { res.json({ country: 'Unknown' }) }
})

export default app
