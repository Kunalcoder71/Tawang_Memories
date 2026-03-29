export const adminAuth = (req, res, next) => {
  const password = req.headers['x-admin-password'] || req.body?.adminPassword;
  if (!password || password !== (process.env.ADMIN_PASSWORD || 'admin123')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
