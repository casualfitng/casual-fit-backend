CREATE TYPE "public"."workout_session_status" AS ENUM('in_progress', 'completed', 'abandoned');--> statement-breakpoint
CREATE TABLE "workout_session_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"target_sets" integer NOT NULL,
	"reps_min" integer NOT NULL,
	"reps_max" integer NOT NULL,
	"rest_seconds" integer NOT NULL,
	"rep_unit" text DEFAULT 'reps' NOT NULL,
	"skipped" boolean DEFAULT false NOT NULL,
	"skip_reason" text,
	"suggested_weight_kg" double precision
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_day_id" uuid,
	"client_id" text,
	"weekday" text NOT NULL,
	"title" text NOT NULL,
	"gym_mode" boolean DEFAULT false NOT NULL,
	"status" "workout_session_status" DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"duration_seconds" integer,
	CONSTRAINT "workout_sessions_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "workout_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_exercise_id" uuid NOT NULL,
	"set_number" integer NOT NULL,
	"weight_kg" double precision,
	"reps" integer,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "workout_session_exercises" ADD CONSTRAINT "workout_session_exercises_session_id_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_session_exercises" ADD CONSTRAINT "workout_session_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_plan_day_id_user_plan_days_id_fk" FOREIGN KEY ("plan_day_id") REFERENCES "public"."user_plan_days"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_session_exercise_id_workout_session_exercises_id_fk" FOREIGN KEY ("session_exercise_id") REFERENCES "public"."workout_session_exercises"("id") ON DELETE cascade ON UPDATE no action;