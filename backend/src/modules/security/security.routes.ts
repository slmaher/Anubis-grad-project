import { NextFunction, Response, Router } from "express";

import {
  authenticate,
  authorizeRoles,
  AuthenticatedRequest,
} from "../../common/middleware/auth";
import { UserRole } from "../users/user.roles";
import { SecurityLogModel } from "./securityLog.model";

const securityRouter = Router();

// GET /api/security/logs - admin security and suspicious activity logs
securityRouter.get(
  "/logs",
  authenticate,
  authorizeRoles(UserRole.Admin),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const includeAll = String(req.query.includeAll || "") === "true";
      const limit = Math.min(Number(req.query.limit) || 100, 250);

      const logs = await SecurityLogModel.find(
        includeAll ? {} : { isSuspicious: true },
      )
        .sort({ createdAt: -1 })
        .limit(limit);

      return res.json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  },
);

export { securityRouter };
