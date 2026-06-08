import { Request } from "express";

import { SecurityLogModel } from "./securityLog.model";

const FAILED_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const FAILED_LOGIN_SUSPICIOUS_THRESHOLD = 3;

const getClientIp = (req: Request) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket.remoteAddress || "";
};

export async function recordFailedLoginAttempt(req: Request, email: string) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const ipAddress = getClientIp(req);
  const userAgent = String(req.headers["user-agent"] || "").slice(0, 300);
  const since = new Date(Date.now() - FAILED_LOGIN_WINDOW_MS);
  const identityFilters = [
    ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
    ...(ipAddress ? [{ ipAddress }] : []),
  ];

  const repeatedFailures = identityFilters.length
    ? await SecurityLogModel.countDocuments({
        type: "failed_login",
        createdAt: { $gte: since },
        $or: identityFilters,
      })
    : 0;

  const attemptCount = repeatedFailures + 1;
  const isSuspicious = attemptCount >= FAILED_LOGIN_SUSPICIOUS_THRESHOLD;

  await SecurityLogModel.create({
    type: "failed_login",
    title: isSuspicious
      ? "Repeated invalid login credentials"
      : "Invalid login credentials",
    details: isSuspicious
      ? `Invalid login credentials were submitted ${attemptCount} times within 15 minutes.`
      : "A login attempt failed because the email or password was incorrect.",
    email: normalizedEmail || undefined,
    ipAddress: ipAddress || undefined,
    userAgent: userAgent || undefined,
    attemptCount,
    severity: isSuspicious ? "high" : "medium",
    isSuspicious,
  });
}
