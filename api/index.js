import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { transporter, upload, supabase, generateCompactKey } from './utils.js'

import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import subdomainRoutes from './routes/subdomain.js'
import adminRoutes from './routes/admin.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: true, credentials: true })) 
app.use(express.json({ limit: '10kb' })) 

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100,
  message: { success: false, error: "Traffic limit reached" }
})
app.use(limiter)

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 50, 
  message: { success: false, error: "Auth limit reached" }
})

app.get('/api', (req, res) => res.json({ status: 'Online', system: 'V3.5 God Mode' }))

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/subdomain', subdomainRoutes)
app.use('/api/admin', adminRoutes) // Register Admin Routes

// ... (Sisa kode lookup-ip, contact, regenerate-keys SAMA SEPERTI SEBELUMNYA)
// Copy paste dari file sebelumnya jika perlu, atau biarkan jika sudah ada.
app.get('/api/lookup-ip', async (req, res) => {
    try {
        const lookup = await fetch(`http://ip-api.com/json/${req.query.ip || ''}`)
        const data = await lookup.json()
        res.json({ country: data.country || 'Unknown', city: data.city || 'Unknown', isp: data.isp })
    } catch { res.json({ country: 'Unknown' }) }
})

app.post('/api/contact/send', upload.single('image'), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body
    const file = req.file
    const attachments = []
    if (file) attachments.push({ filename: file.originalname, content: file.buffer })
    
    const htmlContent = `<div style="font-family:sans-serif;color:#333"><h2 style="border-bottom:2px solid #eee;padding-bottom:10px">Laporan Aduan</h2><p><strong>Dari:</strong> ${name} (${email})</p><p><strong>Hal:</strong> ${subject}</p><div style="background:#f9f9f9;padding:15px;border-left:4px solid #3b82f6;margin:20px 0"><p style="margin:0;white-space:pre-wrap">${message}</p></div>${file?'<p><em>*Ada lampiran gambar.</em></p>':''}</div>`
    
    await transporter.sendMail({ from: `"Aduan System" <${process.env.NODEMAILER_EMAIL}>`, to: process.env.ADMIN_EMAIL, replyTo: email, subject: `[ADUAN] ${subject}`, html: htmlContent, attachments })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ success: false }) }
})

app.post('/api/system/regenerate-all-keys', async (req, res) => {
    try {
        const { adminEmail } = req.body
        if(adminEmail !== process.env.ADMIN_EMAIL) return res.status(403).json({success: false, error: "Unauthorized"})

        const { data: users } = await supabase.from('users').select('id, email')
        let count = 0
        
        for (const user of users) {
            const newKey = generateCompactKey()
            await supabase.from('users').update({ api_key: newKey }).eq('id', user.id)
            await supabase.auth.admin.updateUserById(user.id, { user_metadata: { api_key: newKey } })
            count++
        }
        res.json({ success: true, message: `Updated ${count} users.` })
    } catch(e) { res.status(500).json({success:false, error: e.message}) }
})

export default app
