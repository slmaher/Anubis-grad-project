import mongoose, { Document, Schema } from "mongoose";

export type SecurityLogSeverity = "low" | "medium" | "high";

export interface ISecurityLog extends Document {
  type: string;
  title: string;
  details: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  attemptCount?: number;
  severity: SecurityLogSeverity;
  isSuspicious: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SecurityLogSchema = new Schema<ISecurityLog>(
  {
    type: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    details: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    ipAddress: { type: String, trim: true, index: true },
    userAgent: { type: String, trim: true },
    attemptCount: { type: Number, min: 0 },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true,
    },
    isSuspicious: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

SecurityLogSchema.index({ createdAt: -1 });
SecurityLogSchema.index({ email: 1, type: 1, createdAt: -1 });
SecurityLogSchema.index({ ipAddress: 1, type: 1, createdAt: -1 });

export const SecurityLogModel = mongoose.model<ISecurityLog>(
  "SecurityLog",
  SecurityLogSchema,
);
