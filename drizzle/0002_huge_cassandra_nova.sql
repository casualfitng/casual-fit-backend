CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"primary_muscles" text[] DEFAULT '{}' NOT NULL,
	"secondary_muscles" text[] DEFAULT '{}' NOT NULL,
	"equipment" text[] DEFAULT '{}' NOT NULL,
	"difficulty" text NOT NULL,
	"instructions" text[] DEFAULT '{}' NOT NULL,
	"mistakes" text[] DEFAULT '{}' NOT NULL,
	"alternative_slugs" text[] DEFAULT '{}' NOT NULL,
	"demo_url" text,
	CONSTRAINT "exercises_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "programme_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"programme_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"title" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programme_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"sets" integer NOT NULL,
	"reps_min" integer NOT NULL,
	"reps_max" integer NOT NULL,
	"rest_seconds" integer NOT NULL,
	"rep_unit" text DEFAULT 'reps' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programmes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"goal" text NOT NULL,
	"location" text NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "programmes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_plan_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"weekday" text NOT NULL,
	"title" text NOT NULL,
	"is_rest" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_plan_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"sets" integer NOT NULL,
	"reps_min" integer NOT NULL,
	"reps_max" integer NOT NULL,
	"rest_seconds" integer NOT NULL,
	"rep_unit" text DEFAULT 'reps' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"programme_id" uuid,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "programme_days" ADD CONSTRAINT "programme_days_programme_id_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_exercises" ADD CONSTRAINT "programme_exercises_day_id_programme_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."programme_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_exercises" ADD CONSTRAINT "programme_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plan_days" ADD CONSTRAINT "user_plan_days_plan_id_user_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."user_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plan_exercises" ADD CONSTRAINT "user_plan_exercises_day_id_user_plan_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."user_plan_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plan_exercises" ADD CONSTRAINT "user_plan_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plans" ADD CONSTRAINT "user_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plans" ADD CONSTRAINT "user_plans_programme_id_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."programmes"("id") ON DELETE no action ON UPDATE no action;