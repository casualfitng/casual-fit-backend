ALTER TABLE "profiles" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "age" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "gender" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "height_cm" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "weight_kg" double precision;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "goal_weight_kg" double precision;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "goals" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "experience" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "equipment" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "training_days" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "activity_level" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "cuisines" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "restrictions" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "calorie_target" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "protein_target_g" integer;