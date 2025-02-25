export const config = {
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },
  database: {
    url: process.env.DATABASE_URL
  },
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    secure: true
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
    credentials: true
  }
};
