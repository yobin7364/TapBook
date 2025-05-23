export function authorizeUserOrAdmin(req, res, next) {
  if (!['admin', 'user'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' })
  }
  next()
}
