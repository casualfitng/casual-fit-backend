ALTER TABLE "profiles" ADD COLUMN "avatar_data" text;
ALTER TABLE "profiles" ADD COLUMN "avatar_mime_type" text;
UPDATE "profiles" SET "avatar_url" = NULL WHERE "avatar_url" LIKE '/uploads/%';
