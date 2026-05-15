import { pgTable, serial, text, varchar, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  otp: varchar('otp', { length: 6 }),
  otp_expiry: timestamp('otp_expiry'),
  is_verified: boolean('is_verified').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const complaints = pgTable('complaints', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  district: varchar('district', { length: 255 }).notNull().default('Unknown'),
  police_station: varchar('police_station', { length: 255 }).notNull().default('Unknown'),
  service_type: varchar('service_type', { length: 255 }).notNull(),
  rating_behavior: integer('rating_behavior').notNull().default(0),
  rating_time: integer('rating_time').notNull().default(0),
  rating_cleanliness: integer('rating_cleanliness').notNull().default(0),
  is_corruption_free: boolean('is_corruption_free').notNull().default(true),
  complaint_text: text('complaint_text').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});
