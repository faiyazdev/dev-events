import { Schema, model, models, type Model, type HydratedDocument } from 'mongoose';

// Helper validators/utilities kept small and dependency-free
const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.length > 0 && v.every(isNonEmptyString);

// Generate URL-friendly slug; only letters/numbers and single dashes
const slugify = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Normalize to ISO date string (YYYY-MM-DD) using UTC to avoid TZ drift
const normalizeDate = (input: string): string => {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new Error('Invalid date format');
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Normalize time to 24h HH:mm; accepts "9", "9:30", "9pm", "9:30 PM", "21:30"
const normalizeTime = (input: string): string => {
  let s = input.trim().toLowerCase().replace(/\s+/g, ' ');
  const ampm = s.match(/^(\d{1,2})(?::(\d{2}))?\s*([ap]m)$/i);
  if (ampm) {
    let hh = parseInt(ampm[1]!, 10);
    const mm = parseInt(ampm[2] ?? '0', 10);
    const isPM = ampm[3]!.startsWith('p');
    if (hh === 12) hh = isPM ? 12 : 0; else if (isPM) hh += 12;
    if (hh > 23 || mm > 59) throw new Error('Invalid time');
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }
  const hColon = s.match(/^(\d{1,2}):(\d{2})$/);
  if (hColon) {
    const hh = parseInt(hColon[1]!, 10);
    const mm = parseInt(hColon[2]!, 10);
    if (hh > 23 || mm > 59) throw new Error('Invalid time');
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }
  const hourOnly = s.match(/^(\d{1,2})$/);
  if (hourOnly) {
    const hh = parseInt(hourOnly[1]!, 10);
    if (hh > 23) throw new Error('Invalid time');
    return `${String(hh).padStart(2, '0')}:00`;
  }
  throw new Error('Invalid time');
};

export interface Event {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // ISO YYYY-MM-DD
  time: string; // HH:mm 24h
  mode: string; // e.g., online | offline | hybrid
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<Event>;
export interface EventModel extends Model<Event> {}

const nonEmpty = {
  validator: isNonEmptyString,
  message: '{PATH} cannot be empty',
};

const nonEmptyStringArray = {
  validator: isStringArray,
  message: '{PATH} must be a non-empty array of non-empty strings',
};

const eventSchema = new Schema<Event, EventModel>(
  {
    title: { type: String, required: true, trim: true, validate: nonEmpty },
    slug: { type: String, required: true, unique: true, index: true }, // unique index for SEO-friendly URLs
    description: { type: String, required: true, trim: true, validate: nonEmpty },
    overview: { type: String, required: true, trim: true, validate: nonEmpty },
    image: { type: String, required: true, trim: true, validate: nonEmpty },
    venue: { type: String, required: true, trim: true, validate: nonEmpty },
    location: { type: String, required: true, trim: true, validate: nonEmpty },
    date: { type: String, required: true, trim: true, validate: nonEmpty },
    time: { type: String, required: true, trim: true, validate: nonEmpty },
    mode: { type: String, required: true, trim: true, validate: nonEmpty },
    audience: { type: String, required: true, trim: true, validate: nonEmpty },
    agenda: { type: [String], required: true, validate: nonEmptyStringArray },
    organizer: { type: String, required: true, trim: true, validate: nonEmpty },
    tags: { type: [String], required: true, validate: nonEmptyStringArray },
  },
  { timestamps: true, versionKey: false }
);

// Pre-save: generate slug from title (only when new or title changed),
// and normalize date/time formats for consistency.
eventSchema.pre('save', function (next) {
  try {
    const doc = this as EventDocument;

    if (doc.isNew || doc.isModified('title')) {
      doc.slug = slugify(doc.title);
    }

    if (doc.isModified('date') || doc.isNew) {
      doc.date = normalizeDate(doc.date);
    }

    if (doc.isModified('time') || doc.isNew) {
      doc.time = normalizeTime(doc.time);
    }

    // Extra safeguard: ensure required strings/arrays are non-empty after trimming
    const requiredStrings: Array<keyof Event> = [
      'title','description','overview','image','venue','location','mode','audience','organizer'
    ];
    for (const key of requiredStrings) {
      const val = (doc as unknown as Record<string, unknown>)[key];
      if (!isNonEmptyString(val)) throw new Error(`${key} cannot be empty`);
    }
    if (!isStringArray(doc.agenda)) throw new Error('agenda must be a non-empty string array');
    if (!isStringArray(doc.tags)) throw new Error('tags must be a non-empty string array');

    next();
  } catch (err) {
    next(err as Error);
  }
});

export const Event = (models.Event as EventModel | undefined) ?? model<Event, EventModel>('Event', eventSchema);
