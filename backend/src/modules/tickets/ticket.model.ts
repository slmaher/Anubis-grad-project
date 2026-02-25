import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  user: mongoose.Types.ObjectId;
  museum: mongoose.Types.ObjectId;
  visitDate: Date;
  numberOfGuests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    museum: {
      type: Schema.Types.ObjectId,
      ref: 'Museum',
      required: true
    },
    visitDate: {
      type: Date,
      required: true
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

export const TicketModel = mongoose.model<ITicket>('Ticket', TicketSchema);
