import express from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import xss from 'xss'
import { supabase, upload, logActivity } from '../utils.js'

const router = express.Router()

router.post('/update-profile', upload.single('avatar'), async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.toLowerCase().trim() : ''
    const { name, bio, phone } = req.body
    const file = req.file
    let avatarUrl = null
    if (file) {
      const fileName = `${crypto.randomUUID()}_${file.originalname.replace(/[^a-zA-Z0-9.]/g, '')}`
      await supabase.storage.from('avatars').upload(fileName, file.buffer, { contentType: file.mimetype, upsert: true })
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      avatarUrl = data.publicUrl
    }
    const update = { name: xss(name), bio: xss(bio), phone: xss(phone) }
    if (avatarUrl) update.avatar_url = avatarUrl
    await supabase.from('users').update(update).eq('email', email)
    const { data: updatedUser } = await supabase.from('users').select('*').eq('email', email).single()
    res.json({ success: true, user: updatedUser })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

router.post('/change-password', async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.toLowerCase().trim() : ''
    const { oldPassword, newPassword } = req.body
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single()
    if (!await bcrypt.compare(oldPassword, user.password_hash)) return res.status(400).json({ success: false, error: "Password lama salah." })
    const newHash = await bcrypt.hash(newPassword, 10)
    await supabase.from('users').update({ password_hash: newHash }).eq('email', email)
    res.json({ success: true })
  } catch (e) { res.status(500).json({success: false, error: e.message}) }
})

router.delete('/delete-account', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key']
    const { password } = req.body
    const { data: user } = await supabase.from('users').select('*').eq('api_key', apiKey).single()
    if(!user || !await bcrypt.compare(password, user.password_hash)) return res.status(403).json({success: false})

    const { data: subdomains } = await supabase.from('subdomains').select('*').eq('user_id', user.id)
    if(subdomains?.length > 0) {
        for (const sub of subdomains) {
            if(sub.cf_id && sub.cf_id !== 'unknown') {
                const { data: domainConfig } = await supabase.from('domains').select('*').eq('domain', sub.parent_domain || 'domku.my.id').single()
                const zoneId = domainConfig?.zone_id || process.env.CLOUDFLARE_ZONE_ID
                const token = domainConfig?.api_token || process.env.CLOUDFLARE_API_KEY
                if(domainConfig) {
                    await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${sub.cf_id}`, {
                        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                    })
                }
            }
        }
    }
    await supabase.from('subdomains').delete().eq('user_id', user.id)
    await supabase.from('activity_logs').delete().eq('user_id', user.id)
    await supabase.from('auth_tokens').delete().eq('email', user.email)
    await supabase.auth.admin.deleteUser(user.id)
    await supabase.from('users').delete().eq('id', user.id)
    res.json({success: true})
  } catch (e) { res.status(500).json({success: false, error: e.message}) }
})

export default router
