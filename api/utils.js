import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import multer from 'multer'

dotenv.config()

export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD
  }
})

export const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 5 * 1024 * 1024 } 
})

export const BANNED_SUBDOMAINS = ['www', 'mail', 'remote', 'blog', 'webmail', 'server', 'ns1', 'ns2', 'smtp', 'secure', 'vpn', 'm', 'shop', 'admin', 'panel', 'cpanel', 'whm', 'billing', 'support', 'test', 'dev', 'root', 'ftp', 'pop', 'imap', 'status', 'api', 'app', 'dashboard', 'auth', 'login', 'domku', 'root']
export const SUBDOMAIN_REGEX = /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/

export const isPrivateIP = (ip) => {
   const parts = ip.split('.')
   if (parts.length !== 4) return false
   if (parts[0] === '10') return true
   if (parts[0] === '172' && parts[1] >= 16 && parts[1] <= 31) return true
   if (parts[0] === '192' && parts[1] === '168') return true
   if (parts[0] === '127') return true
   return false
}

export const generateCompactKey = () => {
    const letters = 'abcdefghijklmnopqrstuvwxyz'
    const nums = '0123456789'
    const syms = '!@#$%^&*'
    let chars = []
    
    for(let i=0; i<4; i++) chars.push(letters[Math.floor(Math.random() * letters.length)])
    for(let i=0; i<3; i++) chars.push(nums[Math.floor(Math.random() * nums.length)])
    for(let i=0; i<2; i++) chars.push(syms[Math.floor(Math.random() * syms.length)])
    
    return chars.sort(() => Math.random() - 0.5).join('')
}

export const logActivity = async (userId, action, details, req) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
    await supabase.from('activity_logs').insert({ user_id: userId, action, details, ip_address: ip })
  } catch (e) { console.error("Log error:", e) }
}

export const getHtmlTemplate = (title, message, buttonText = null, buttonUrl = null, code = null) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased; }
      .wrapper { width: 100%; table-layout: fixed; background-color: #f4f6f8; padding-bottom: 40px; }
      .main-table { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 0; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
      .content { padding: 40px 30px; text-align: center; }
      .icon-circle { width: 60px; height: 60px; background-color: #eff6ff; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: #3b82f6; font-size: 30px; font-weight: bold; }
      h2 { color: #1e293b; font-size: 22px; margin-bottom: 16px; font-weight: 700; }
      p { color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
      .btn { background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block; transition: all 0.3s; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
      .btn:hover { background-color: #1d4ed8; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4); }
      .code-box { background-color: #f1f5f9; padding: 20px; border-radius: 12px; font-family: 'Courier New', monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #334155; margin: 20px 0; border: 2px dashed #cbd5e1; }
      .footer { background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; }
      .footer p { font-size: 12px; color: #94a3b8; margin: 0; }
      .link-fallback { margin-top: 30px; font-size: 12px; color: #cbd5e1; word-break: break-all; }
      .link-fallback a { color: #3b82f6; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <br><br>
      <table class="main-table" cellspacing="0" cellpadding="0">
        <tr>
          <td class="header">
            <h1>DOMKU</h1>
          </td>
        </tr>
        <tr>
          <td class="content">
            <div class="icon-circle">➜</div>
            <h2>${title}</h2>
            <div style="text-align: left; margin-bottom: 30px;">
              ${message}
            </div>
            
            ${code ? `<div class="code-box">${code}</div>` : ''}
            
            ${buttonUrl ? `<a href="${buttonUrl}" class="btn">${buttonText}</a>` : ''}

            ${buttonUrl ? `
              <div class="link-fallback">
                <p>Jika tombol tidak berfungsi, salin link berikut:</p>
                <a href="${buttonUrl}">${buttonUrl}</a>
              </div>
            ` : ''}
          </td>
        </tr>
        <tr>
          <td class="footer">
            <p>&copy; 2026 Domku Manager. All rights reserved.</p>
            <p>Padang, Sumatera Barat, Indonesia.</p>
          </td>
        </tr>
      </table>
    </div>
  </body>
  </html>
  `
}
