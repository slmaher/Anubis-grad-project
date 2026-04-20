import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  museum: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  location?: string;
  imageUrl?: string;
  maxAttendees?: number;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    museum: {
      type: Schema.Types.ObjectId,
      ref: "Museum",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    location: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    maxAttendees: {
      type: Number,
      min: 1,
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// Validation: endDate must be after startDate
EventSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("End date must be after start date"));
  } else {
    next();
  }
});

export const EventModel = mongoose.model<IEvent>("Event", EventSchema);
