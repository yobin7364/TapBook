import jwt from 'jsonwebtoken'
import User from '../models/User.module.js'
import keys from '../config/keys.config.js'


// export const authenticate = async (req, res, next) => {
//   const authHeader = req.headers.authorization
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res
//       .status(401)
//       .json({ success: false, error: 'No token, authorization denied' })
//   }
//   const token = authHeader.split(' ')[1]
//   try {
//     const decoded = jwt.verify(token, keys.secretOrKey)
//     req.user = await User.findById(decoded.id).select('-password')
//     if (!req.user) {
//       return res.status(401).json({ success: false, error: 'User not found' })
//     }
//     next()
//   } catch (err) {
//     return res.status(401).json({ success: false, error: 'Token is not valid' })
//   }
// }

export function authorizeUserOrAdmin(req, res, next) {
  if (!['admin', 'user'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' })
  }
  next()
}
