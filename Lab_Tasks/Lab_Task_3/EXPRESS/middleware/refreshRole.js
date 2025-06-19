import { User } from "../models/user.js";

export async function refreshRole(req, _res, next) {
  if (!req.session.user) return next();          // no login → skip

  const SYNC_INTERVAL = 1 * 1000;               // 10 s cadence
  const now           = Date.now();
  const lastSync      = req.session.roleSyncedAt || 0;

  if (now - lastSync < SYNC_INTERVAL) return next();

  const dbUser = await User.findById(req.session.user.id).select("isAdmin");
  if (dbUser && dbUser.isAdmin !== req.session.user.isAdmin) {
    req.session.user.isAdmin = dbUser.isAdmin;   // keep session + views aligned
  }
  req.session.roleSyncedAt = now;                // mark refresh time
  next();
}
