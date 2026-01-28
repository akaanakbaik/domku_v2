import express from 'express'
import { supabase } from '../utils.js'

const router = express.Router()

// Middleware Keamanan Tingkat Tinggi
const adminCheck = (req, res, next) => {
    const email = req.headers['x-admin-email']
    if (email !== 'khaliqarrasyidabdul@gmail.com') {
        return res.status(403).json({ success: false, error: 'Unauthorized: God Mode Access Denied' })
    }
    next()
}

router.use(adminCheck)

// 1. DASHBOARD STATS (ULTIMATE)
router.get('/stats', async (req, res) => {
    try {
        const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true })
        const { count: subs } = await supabase.from('subdomains').select('*', { count: 'exact', head: true })
        const { count: logs } = await supabase.from('activity_logs').select('*', { count: 'exact', head: true })
        const { count: banned } = await supabase.from('banned_emails').select('*', { count: 'exact', head: true })
        
        // Settings
        const { data: settings } = await supabase.from('system_settings').select('*')
        const maintenance = settings?.find(s => s.key === 'maintenance_mode')?.value === 'true'
        
        // Logs
        const { data: recentLogs } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(15)

        res.json({
            success: true,
            stats: {
                users: users || 0,
                subdomains: subs || 0,
                logs: logs || 0,
                banned: banned || 0,
                maintenance: maintenance,
                server_load: Math.floor(Math.random() * 30) + 10, // Mock
                memory_usage: Math.floor(Math.random() * 40) + 20 // Mock
            },
            logs: recentLogs || []
        })
    } catch (e) { 
        res.status(500).json({ success: false, error: e.message }) 
    }
})

// 2. USER MANAGEMENT
router.get('/users', async (req, res) => {
    try {
        const { data: users } = await supabase.from('users').select(`*, subdomains:subdomains(count), activity_logs(count)`).order('created_at', { ascending: false })
        
        const enhancedUsers = users.map(u => ({
            ...u,
            risk_score: u.subdomains[0].count > 20 ? 'HIGH' : u.activity_logs[0].count > 100 ? 'MEDIUM' : 'LOW'
        }))

        res.json({ success: true, users: enhancedUsers })
    } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// 3. SYSTEM CONTROL (Maintenance & Settings)
router.post('/settings/update', async (req, res) => {
    try {
        const { key, value } = req.body
        await supabase.from('system_settings').upsert({ key, value })
        res.json({ success: true })
    } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// 4. IP BLACKLIST MANAGER
router.get('/blacklist', async (req, res) => {
    try {
        const { data } = await supabase.from('ip_blacklist').select('*').order('banned_at', { ascending: false })
        res.json({ success: true, data })
    } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

router.post('/blacklist', async (req, res) => {
    try {
        const { ip, reason } = req.body
        await supabase.from('ip_blacklist').insert({ ip_address: ip, reason })
        res.json({ success: true })
    } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

router.delete('/blacklist/:id', async (req, res) => {
    try {
        await supabase.from('ip_blacklist').delete().eq('id', req.params.id)
        res.json({ success: true })
    } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// 5. GOD MODE ACTIONS (Ban, Wipe, Reset Key)
router.post('/god-action', async (req, res) => {
    try {
        const { action, payload } = req.body
        
        if (action === 'BAN_USER') {
            const { userId, email } = payload
            await supabase.from('banned_emails').insert({ email, reason: 'Admin Ban' })
            await supabase.from('subdomains').delete().eq('user_id', userId)
            await supabase.auth.admin.deleteUser(userId)
            await supabase.from('users').delete().eq('id', userId)
        }
        
        if (action === 'WIPE_LOGS') {
            await supabase.from('activity_logs').delete().neq('id', 0) // Delete All
        }

        res.json({ success: true })
    } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// 6. NOTIFICATION SYSTEM
router.get('/notifications', async (req, res) => {
    try {
        const { data } = await supabase.from('system_notifications').select('*').order('created_at', { ascending: false })
        res.json({ success: true, data })
    } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

router.post('/notifications', async (req, res) => {
    try {
        const { title, message, type, image_url } = req.body
        await supabase.from('system_notifications').insert({ title, message, type, image_url })
        res.json({ success: true })
    } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

router.delete('/notifications/:id', async (req, res) => {
    try {
        await supabase.from('system_notifications').delete().eq('id', req.params.id)
        res.json({ success: true })
    } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

export default router
