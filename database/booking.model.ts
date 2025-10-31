import { Schema, model, models, type Model, type HydratedDocument, Types } from 'mongoose';
import { Event } from './event.model';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface Booking {
  eventId: Types.ObjectId; // FK -> Event
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDocument = HydratedDocument<Booking>;
export interface BookingModel extends Model<Booking> {}

const bookingSchema = new Schema<Booking, BookingModel>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => emailRegex.test(v),
        message: 'Invalid email format',
      },
    },
  },
  { timestamps: true, versionKey: false }
);

// Index to speed up queries by event
bookingSchema.index({ eventId: 1 });

// Pre-save: ensure referenced Event exists and email is valid/normalized
bookingSchema.pre('save', async function (next) {
  try {
    const doc = this as BookingDocument;

    // Normalize email again defensively
    if (doc.isModified('email') || doc.isNew) {
      doc.email = doc.email.trim().toLowerCase();
      if (!emailRegex.test(doc.email)) throw new Error('Invalid email format');
    }

    if (doc.isModified('eventId') || doc.isNew) {
      const exists = await Event.exists({ _id: doc.eventId });
      if (!exists) throw new Error('Referenced event does not exist');
    }

    next();
  } catch (err) {
    next(err as Error);
  }
});

export const Booking = (models.Booking as BookingModel | undefined) ?? model<Booking, BookingModel>('Booking', bookingSchema);
