import {
  boolean,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin"]);
export const authProvider = pgEnum("auth_provider", ["google", "apple"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  role: userRole("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userIdentities = pgTable(
  "user_identities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: authProvider("provider").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("user_identities_provider_user_idx").on(table.provider, table.providerUserId),
  ],
);

export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name"),
  age: integer("age"),
  gender: text("gender"),
  heightCm: integer("height_cm"),
  weightKg: doublePrecision("weight_kg"),
  goalWeightKg: doublePrecision("goal_weight_kg"),
  goals: text("goals").array().notNull().default([]),
  experience: text("experience"),
  location: text("location"),
  equipment: text("equipment").array().notNull().default([]),
  trainingDays: text("training_days").array().notNull().default([]),
  activityLevel: text("activity_level"),
  cuisines: text("cuisines").array().notNull().default([]),
  restrictions: text("restrictions").array().notNull().default([]),
  calorieTarget: integer("calorie_target"),
  proteinTargetG: integer("protein_target_g"),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  /** External URL (e.g. Google profile photo). */
  avatarUrl: text("avatar_url"),
  /** Base64-encoded uploaded photo (Render-safe; lives in Postgres). */
  avatarData: text("avatar_data"),
  avatarMimeType: text("avatar_mime_type"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  primaryMuscles: text("primary_muscles").array().notNull().default([]),
  secondaryMuscles: text("secondary_muscles").array().notNull().default([]),
  equipment: text("equipment").array().notNull().default([]),
  difficulty: text("difficulty").notNull(),
  instructions: text("instructions").array().notNull().default([]),
  mistakes: text("mistakes").array().notNull().default([]),
  alternativeSlugs: text("alternative_slugs").array().notNull().default([]),
  demoUrl: text("demo_url"),
});

export const programmes = pgTable("programmes", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  goal: text("goal").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
});

export const programmeDays = pgTable("programme_days", {
  id: uuid("id").primaryKey().defaultRandom(),
  programmeId: uuid("programme_id")
    .notNull()
    .references(() => programmes.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  title: text("title").notNull(),
});

export const programmeExercises = pgTable("programme_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  dayId: uuid("day_id")
    .notNull()
    .references(() => programmeDays.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => exercises.id),
  position: integer("position").notNull(),
  sets: integer("sets").notNull(),
  repsMin: integer("reps_min").notNull(),
  repsMax: integer("reps_max").notNull(),
  restSeconds: integer("rest_seconds").notNull(),
  repUnit: text("rep_unit").notNull().default("reps"),
});

export const userPlans = pgTable("user_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  programmeId: uuid("programme_id").references(() => programmes.id),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userPlanDays = pgTable("user_plan_days", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id")
    .notNull()
    .references(() => userPlans.id, { onDelete: "cascade" }),
  weekday: text("weekday").notNull(),
  title: text("title").notNull(),
  isRest: boolean("is_rest").notNull().default(false),
  position: integer("position").notNull(),
});

export const userPlanExercises = pgTable("user_plan_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  dayId: uuid("day_id")
    .notNull()
    .references(() => userPlanDays.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => exercises.id),
  position: integer("position").notNull(),
  sets: integer("sets").notNull(),
  repsMin: integer("reps_min").notNull(),
  repsMax: integer("reps_max").notNull(),
  restSeconds: integer("rest_seconds").notNull(),
  repUnit: text("rep_unit").notNull().default("reps"),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workoutSessionStatus = pgEnum("workout_session_status", [
  "in_progress",
  "completed",
  "abandoned",
]);

export const workoutSessions = pgTable("workout_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planDayId: uuid("plan_day_id").references(() => userPlanDays.id, { onDelete: "set null" }),
  clientId: text("client_id").unique(),
  weekday: text("weekday").notNull(),
  title: text("title").notNull(),
  gymMode: boolean("gym_mode").notNull().default(false),
  status: workoutSessionStatus("status").notNull().default("in_progress"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  durationSeconds: integer("duration_seconds"),
});

export const workoutSessionExercises = pgTable("workout_session_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => workoutSessions.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => exercises.id),
  position: integer("position").notNull(),
  targetSets: integer("target_sets").notNull(),
  repsMin: integer("reps_min").notNull(),
  repsMax: integer("reps_max").notNull(),
  restSeconds: integer("rest_seconds").notNull(),
  repUnit: text("rep_unit").notNull().default("reps"),
  skipped: boolean("skipped").notNull().default(false),
  skipReason: text("skip_reason"),
  suggestedWeightKg: doublePrecision("suggested_weight_kg"),
});

export const workoutSets = pgTable("workout_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionExerciseId: uuid("session_exercise_id")
    .notNull()
    .references(() => workoutSessionExercises.id, { onDelete: "cascade" }),
  setNumber: integer("set_number").notNull(),
  weightKg: doublePrecision("weight_kg"),
  reps: integer("reps"),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const weightLogs = pgTable("weight_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  weightKg: doublePrecision("weight_kg").notNull(),
  loggedOn: text("logged_on").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
