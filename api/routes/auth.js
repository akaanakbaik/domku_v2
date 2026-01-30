import express from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import xss from 'xss'
import { supabase, transporter, getHtmlTemplate, generateCompactKey, logActivity } from '../utils.js'

const router = express.Router()

// Helper Check Banned
const checkBanned = async (email) => {
    const { data } = await supabase.from('banned_emails').select('id').eq('email', email).single()
    return !!data
}

router.post('/register', async (req, res) => {
  try {
    const name = xss(req.body.name || '')
    const rawEmail = xss(req.body.email || '')
    const password = req.body.password || ''
    const origin = req.body.origin || ''

    if (!name || !rawEmail || !password) return res.status(400).json({ success: false, error: "Data registrasi tidak lengkap." })
    const email = rawEmail.toLowerCase().trim()

    // CEK BAN
    if (await checkBanned(email)) {
        return res.status(403).json({ success: false, error: "Email ini telah diblokir karena pelanggaran kebijakan layanan." })
    }

    const { data: userList } = await supabase.auth.admin.listUsers()
    if (userList?.users?.find(u => u.email === email)) return res.status(400).json({ success: false, error: "Email sudah terdaftar." })

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 10 * 60000)

    await supabase.from('pending_registrations').delete().eq('email', email)
    await supabase.from('pending_registrations').insert({ name, email, password_hash: passwordHash })
    await supabase.from('auth_tokens').insert({ email, token, type: 'VERIFY_EMAIL', expires_at: expiresAt })

    const verifyUrl = `${origin}/verify-email?token=${token}&email=${email}`
    
    const emailMessage = `
      <p>Halo <strong>${name}</strong>,</p>
      <p>Terima kasih telah mendaftar di Domku Manager. Untuk mulai mengelola subdomain dan DNS Anda, silakan verifikasi alamat email Anda dengan menekan tombol di bawah ini.</p>
      <p>Link ini hanya berlaku selama 10 menit demi keamanan akun Anda.</p>
    `
    const html = getHtmlTemplate('Verifikasi Akun', emailMessage, 'Verifikasi Email Saya', verifyUrl)
    
    await transporter.sendMail({ from: `"Domku Team" <${process.env.NODEMAILER_EMAIL}>`, to: email, subject: 'Selesaikan Pendaftaran Anda', html })

    res.json({ success: true, message: "Email verifikasi terkirim." })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

router.post('/login-check', async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.toLowerCase().trim() : ''
    const password = req.body.password || ''

    // CEK BAN
    if (await checkBanned(email)) {
        return res.status(403).json({ success: false, error: "Akun ini telah diblokir permanen." })
    }

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    if (!user) return res.status(400).json({ success: false, error: "Email tidak terdaftar." })
    if (!await bcrypt.compare(password, user.password_hash)) return res.status(400).json({ success: false, error: "Password salah." })

    const code = Math.floor(1000 + Math.random() * 9000).toString()
    await supabase.from('verification_codes').upsert({ email, code }, { onConflict: 'email' })
    
    const emailMessage = `<p>Kami mendeteksi permintaan masuk ke akun Anda. Gunakan kode OTP di bawah ini untuk melanjutkan.</p><p>Jangan berikan kode ini kepada siapa pun.</p>`
    const html = getHtmlTemplate('Kode Masuk', emailMessage, null, null, code)
    
    await transporter.sendMail({ from: `"Domku Security" <${process.env.NODEMAILER_EMAIL}>`, to: email, subject: 'Kode OTP Login', html })

    res.json({ success: true })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

// Sisa endpoint (verify-email, verify-otp, forgot-pass, reset-pass) tetap sama seperti sebelumnya
// Copy paste dari kode sebelumnya untuk bagian bawah ini
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body
    const emailInput = req.body.email ? req.body.email.toLowerCase().trim() : null
    const { data: tokenData } = await supabase.from('auth_tokens').select('*').eq('token', token).eq('type', 'VERIFY_EMAIL').single()

    if (!tokenData) {
        if (emailInput) {
            const { data: existing } = await supabase.from('users').select('id').eq('email', emailInput).single()
            if (existing) return res.json({ success: true, message: 'Akun sudah aktif.' })
        }
        return res.status(400).json({ success: false, error: "Link verifikasi tidak valid atau sudah digunakan." })
    }
    if (new Date(tokenData.expires_at) < new Date()) return res.status(400).json({ success: false, error: "Link verifikasi telah kadaluarsa." })

    const email = tokenData.email.toLowerCase()
    const { data: pending } = await supabase.from('pending_registrations').select('*').eq('email', email).single()
    if (!pending) return res.status(400).json({ success: false, error: "Data registrasi tidak ditemukan." })

    const apiKey = generateCompactKey()

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

    res.json({ success: true, message: "Verifikasi berhasil." })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

router.post('/verify-otp', async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.toLowerCase().trim() : ''
    const { code } = req.body
    const { data: otp } = await supabase.from('verification_codes').select('*').eq('email', email).eq('code', code).single()
    if (!otp) return res.status(400).json({ success: false, error: "Kode OTP Salah." })

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    await supabase.from('verification_codes').delete().eq('email', email)
    await logActivity(user.id, 'LOGIN', 'Berhasil Login', req)
    res.json({ success: true, user })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

router.post('/forgot-password', async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.toLowerCase().trim() : ''
    const origin = req.body.origin
    const { data: user } = await supabase.from('users').select('id, name').eq('email', email).single()
    if (!user) return res.status(404).json({ success: false, error: "Email tidak ditemukan." })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 10 * 60000)
    await supabase.from('auth_tokens').delete().eq('email', email).eq('type', 'RESET_PASSWORD')
    await supabase.from('auth_tokens').insert({ email, token, type: 'RESET_PASSWORD', expires_at: expiresAt })

    const resetUrl = `${origin}/reset-password?token=${token}&email=${email}`
    const emailMessage = `<p>Halo <strong>${user.name}</strong>,</p><p>Kami menerima permintaan untuk mereset password akun Anda. Jika ini bukan Anda, abaikan email ini.</p>`
    const html = getHtmlTemplate('Reset Password', emailMessage, 'Ubah Password', resetUrl)
    
    await transporter.sendMail({ from: `"Domku Security" <${process.env.NODEMAILER_EMAIL}>`, to: email, subject: 'Permintaan Reset Password', html })

    res.json({ success: true })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body
    const { data: tokenData } = await supabase.from('auth_tokens').select('*').eq('token', token).eq('type', 'RESET_PASSWORD').single()
    if (!tokenData || new Date(tokenData.expires_at) < new Date()) return res.status(400).json({ success: false, error: "Link sudah kadaluarsa atau tidak valid." })

    const salt = await bcrypt.genSalt(12)
    const newHash = await bcrypt.hash(newPassword, salt)
    await supabase.from('users').update({ password_hash: newHash }).eq('email', tokenData.email)
    await supabase.from('auth_tokens').delete().eq('token', token)
    res.json({ success: true })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

export default router
