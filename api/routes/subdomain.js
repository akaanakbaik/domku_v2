import express from 'express'
import xss from 'xss'
import { supabase, isPrivateIP, logActivity, SUBDOMAIN_REGEX, BANNED_SUBDOMAINS } from '../utils.js'

const router = express.Router()

// 1. CREATE SUBDOMAIN
router.post('/', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key']
    if (!apiKey) return res.status(401).json({ success: false, error: "API Key required" })
    const { data: user } = await supabase.from('users').select('id').eq('api_key', apiKey).single()
    if (!user) return res.status(403).json({ success: false, error: "Invalid API Key" })

    const rawSubdomain = req.body.subdomain || ''
    const parentDomain = req.body.domain || 'domku.my.id' 
    const recordType = req.body.recordType || 'A'
    let rawTarget = req.body.target || ''
    const subdomain = xss(rawSubdomain).toLowerCase()
    
    if (recordType === 'CNAME') rawTarget = rawTarget.replace(/^https?:\/\//i, '').replace(/\/+$/, '')
    const target = xss(rawTarget)

    if (!subdomain || !target) return res.status(400).json({ success: false, error: "Incomplete data" })
    if (!SUBDOMAIN_REGEX.test(subdomain)) return res.status(400).json({ success: false, error: "Invalid format" })
    if (BANNED_SUBDOMAINS.includes(subdomain)) return res.status(400).json({ success: false, error: "Banned name" })
    if ((recordType === 'A' || recordType === 'AAAA') && isPrivateIP(target)) return res.status(400).json({ success: false, error: "Private IP disallowed" })

    const { data: domainConfig } = await supabase.from('domains').select('*').eq('domain', parentDomain).eq('is_active', true).single()
    if (!domainConfig) return res.status(400).json({ success: false, error: "Domain not supported" })

    const { count } = await supabase.from('subdomains').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if (count >= 30) return res.status(400).json({ success: false, error: "Limit reached (Max 30)" })

    const cfHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${domainConfig.api_token}` }
    const fullDomain = `${subdomain}.${parentDomain}`

    const checkCf = await fetch(`https://api.cloudflare.com/client/v4/zones/${domainConfig.zone_id}/dns_records?name=${fullDomain}`, { headers: cfHeaders })
    const checkData = await checkCf.json()
    if (checkData.result && checkData.result.length > 0) return res.status(400).json({ success: false, error: "Subdomain taken" })

    const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${domainConfig.zone_id}/dns_records`, {
      method: 'POST',
      headers: cfHeaders,
      body: JSON.stringify({ type: recordType, name: subdomain, content: target, ttl: 1, proxied: false })
    })
    const cfData = await cfResponse.json()
    if (!cfData.success) {
      const errMsg = cfData.errors?.[0]?.message || 'Cloudflare Error'
      if (errMsg.includes("private IP")) return res.status(400).json({ success: false, error: "CF rejected Private IP" })
      throw new Error(errMsg)
    }

    await supabase.from('subdomains').insert({ 
        user_id: user.id, 
        name: fullDomain, 
        target, 
        type: recordType, 
        cf_id: cfData.result?.id,
        parent_domain: parentDomain 
    })
    await logActivity(user.id, 'CREATE_SUBDOMAIN', `Created ${fullDomain}`, req)

    res.json({ success: true, data: cfData.result })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

// 2. DELETE SUBDOMAIN
router.delete('/:id', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key']
    const subId = req.params.id
    if (!apiKey) return res.status(401).json({ success: false, error: "Auth required" })
    const { data: user } = await supabase.from('users').select('id').eq('api_key', apiKey).single()
    if (!user) return res.status(403).json({ success: false, error: "Invalid Key" })

    const { data: subData } = await supabase.from('subdomains').select('*').eq('id', subId).eq('user_id', user.id).single()
    if (!subData) return res.status(404).json({ success: false, error: "Not found" })

    const parent = subData.parent_domain || 'domku.my.id'
    const { data: domainConfig } = await supabase.from('domains').select('*').eq('domain', parent).single()
    
    const zoneId = domainConfig?.zone_id || process.env.CLOUDFLARE_ZONE_ID
    const token = domainConfig?.api_token || process.env.CLOUDFLARE_API_KEY

    if (subData.cf_id && subData.cf_id !== 'unknown') {
        await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${subData.cf_id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        })
    }

    await supabase.from('subdomains').delete().eq('id', subId)
    await logActivity(user.id, 'DELETE_SUBDOMAIN', `Deleted ${subData.name}`, req)
    res.json({ success: true })
  } catch (error) { res.status(500).json({ success: false, error: error.message }) }
})

export default router
