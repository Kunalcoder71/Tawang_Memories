export const adminAuth = (req, res, next) => {
  const password = req.headers['x-admin-password'] || req.body?.adminPassword;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin password' });
  }
  next();
};
