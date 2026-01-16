import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const generateApiKey = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  let result = '';
  for (let i = 0; i < 4; i++) result += letters.charAt(Math.floor(Math.random() * letters.length));
  for (let i = 0; i < 3; i++) result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  for (let i = 0; i < 2; i++) result += symbols.charAt(Math.floor(Math.random() * symbols.length));
  
  return result.split('').sort(() => 0.5 - Math.random()).join('');
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD
  }
});

app.post('/api/auth/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    const { error } = await supabase
      .from('verification_codes')
      .upsert({ email, code, created_at: new Date() }, { onConflict: 'email' });

    if (error) throw error;

    await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: 'Kode Verifikasi Domku',
      text: `Kode verifikasi Anda adalah: ${code}`
    });

    res.json({ 
      author: "Aka",
      email_author: "akaanakbaik17@proton.me",
      success: true, 
      message: 'Kode dikirim' 
    });
  } catch (error) {
    res.status(500).json({ 
      author: "Aka",
      email_author: "akaanakbaik17@proton.me",
      success: false, 
      error: error.message 
    });
  }
});

app.post('/api/subdomain', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      author: "Aka",
      email_author: "akaanakbaik17@proton.me",
      success: false,
      error: "API Key diperlukan"
    });
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('api_key', apiKey)
    .single();

  if (userError || !user) {
    return res.status(403).json({
      author: "Aka",
      email_author: "akaanakbaik17@proton.me",
      success: false,
      error: "API Key tidak valid"
    });
  }

  try {
    const { subdomain, recordType, target } = req.body;

    if (!subdomain || !recordType || !target) {
      return res.status(400).json({
        author: "Aka",
        email_author: "akaanakbaik17@proton.me",
        success: false,
        error: "Data tidak lengkap"
      });
    }

    const { count } = await supabase
      .from('subdomains')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (count >= 30) {
      return res.status(400).json({
        author: "Aka",
        email_author: "akaanakbaik17@proton.me",
        success: false,
        error: "Limit subdomain tercapai (Max 30)"
      });
    }

    const cfUrl = `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`;
    const cfResponse = await fetch(cfUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Email': process.env.CLOUDFLARE_EMAIL,
        'X-Auth-Key': process.env.CLOUDFLARE_API_KEY
      },
      body: JSON.stringify({
        type: recordType,
        name: subdomain,
        content: target,
        ttl: 1,
        proxied: true
      })
    });

    const cfData = await cfResponse.json();

    if (!cfData.success) {
      throw new Error(cfData.errors[0]?.message || 'Gagal membuat subdomain di Cloudflare');
    }

    await supabase.from('subdomains').insert({
      user_id: user.id,
      name: `${subdomain}.domku.my.id`,
      target: target,
      type: recordType,
      cf_id: cfData.result.id
    });

    res.json({
      author: "Aka",
      email_author: "akaanakbaik17@proton.me",
      success: true,
      data: cfData.result
    });

  } catch (error) {
    res.status(500).json({
      author: "Aka",
      email_author: "akaanakbaik17@proton.me",
      success: false,
      error: error.message
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
