// Role-based access middleware
export const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Forbidden',
          details: { role: `Requires role: ${roles.join(', ')}` },
        },
      })
    }
    next()
  }
