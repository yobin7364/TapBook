import User from '../models/User.module.js'

export const subscribeMembership = async (req, res) => {
  const { plan } = req.body // 'monthly' or 'yearly'
  if (!['monthly', 'yearly'].includes(plan)) {
    return res.status(400).json({ success: false, error: 'Invalid plan.' })
  }

  const user = await User.findById(req.user.id)
  const now = new Date()
  let newExpiry
  if (plan === 'monthly') {
    newExpiry = new Date(now)
    newExpiry.setMonth(now.getMonth() + 1)
  } else {
    newExpiry = new Date(now)
    newExpiry.setFullYear(now.getFullYear() + 1)
  }

  if (user.membership && user.membership.plan === plan && user.membership.expiryDate > now && !user.membership.cancelled) {
    // Already active, renew by extending expiry
    user.membership.expiryDate = plan === 'monthly'
      ? new Date(user.membership.expiryDate.setMonth(user.membership.expiryDate.getMonth() + 1))
      : new Date(user.membership.expiryDate.setFullYear(user.membership.expiryDate.getFullYear() + 1))
  } else {
    // New or restarting
    user.membership = {
      plan,
      startDate: now,
      expiryDate: newExpiry,
      cancelled: false,
    }
  }
  await user.save()
  return res.json({ success: true, membership: user.membership })
}

export const cancelMembership = async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user.membership || user.membership.plan === 'none') {
    return res.status(400).json({ success: false, error: 'No active membership.' })
  }
  user.membership.cancelled = true
  await user.save()
  return res.json({ success: true, membership: user.membership })
}

export const getMembership = async (req, res) => {
  const user = await User.findById(req.user.id)
  return res.json({ success: true, membership: user.membership })
}
