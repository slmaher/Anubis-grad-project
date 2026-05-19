import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/revive_egypt',
  groqApiKey: process.env.GROQ_API_KEY || '',
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || '',
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB',
  jwtSecret: process.env.JWT_SECRET || 'change_me_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  emailProvider: process.env.EMAIL_PROVIDER || 'console',
  gmailUser: process.env.GMAIL_USER || '',
  gmailPassword: process.env.GMAIL_PASSWORD || '',
  mailtrapToken: process.env.MAILTRAP_TOKEN || '',
  mailtrapHost: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
  mailtrapPort: Number(process.env.MAILTRAP_PORT) || 2525,
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  resetPasswordExpiry: Number(process.env.RESET_PASSWORD_EXPIRY) || 60,
  emailFrom: process.env.EMAIL_FROM || 'no-reply@reviveegypt.com'
};
