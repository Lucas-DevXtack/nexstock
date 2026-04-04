import 'dotenv/config';
function required(name, fallback = '') {
    return process.env[name] || fallback;
}
function parseOrigins(input) {
    return input
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
}
const corsOrigins = parseOrigins(required('CORS_ORIGIN', 'http://localhost:5173'));
export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT || 3333),
    JWT_SECRET: required('JWT_SECRET', 'dev_secret_change_me'),
    CORS_ORIGIN: corsOrigins,
    WEB_URL: required('WEB_URL', corsOrigins[0] || 'http://localhost:5173'),
    WEB_PUBLIC_URL: required('WEB_PUBLIC_URL', ''),
    SMTP_HOST: required('SMTP_HOST'),
    SMTP_PORT: Number(process.env.SMTP_PORT || 587),
    SMTP_USER: required('SMTP_USER'),
    SMTP_PASS: required('SMTP_PASS'),
    SMTP_FROM: required('SMTP_FROM', 'NexStock <no-reply@nexstock.local>'),
    STRIPE_SECRET_KEY: required('STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: required('STRIPE_WEBHOOK_SECRET'),
    STRIPE_PRICE_PRO: required('STRIPE_PRICE_PRO'),
    STRIPE_PRICE_BUSINESS: required('STRIPE_PRICE_BUSINESS'),
    API_PUBLIC_URL: required('API_PUBLIC_URL', `http://localhost:${process.env.PORT || 3333}`),
    WEBHOOK_BASE_URL: required('WEBHOOK_BASE_URL', ''),
    MP_ACCESS_TOKEN: required('MP_ACCESS_TOKEN'),
    MP_PUBLIC_KEY: required('MP_PUBLIC_KEY'),
    MP_APP_ID: required('MP_APP_ID'),
    MP_USE_SANDBOX: ['1', 'true', 'yes', 'on'].includes(String(process.env.MP_USE_SANDBOX || '').toLowerCase()),
};
