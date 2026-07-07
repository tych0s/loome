ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "cycles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "public users are readable" ON "users";--> statement-breakpoint
CREATE POLICY "public users are readable" ON "users" FOR SELECT USING (true);--> statement-breakpoint
DROP POLICY IF EXISTS "users can create their own public profile" ON "users";--> statement-breakpoint
CREATE POLICY "users can create their own public profile" ON "users" FOR INSERT TO authenticated WITH CHECK (
  "id" = auth.uid()
  AND "role" = 'member'
  AND "banned_at" IS NULL
  AND length(btrim("handle")) BETWEEN 3 AND 40
  AND "handle" ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'
  AND length(btrim("display_name")) BETWEEN 1 AND 80
);--> statement-breakpoint
DROP POLICY IF EXISTS "users can update their own public profile" ON "users";--> statement-breakpoint
CREATE POLICY "users can update their own public profile" ON "users" FOR UPDATE TO authenticated USING ("id" = auth.uid()) WITH CHECK (
  "id" = auth.uid()
  AND "role" = 'member'
  AND "banned_at" IS NULL
  AND length(btrim("handle")) BETWEEN 3 AND 40
  AND "handle" ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'
  AND length(btrim("display_name")) BETWEEN 1 AND 80
);--> statement-breakpoint
DROP POLICY IF EXISTS "cycles are publicly readable" ON "cycles";--> statement-breakpoint
CREATE POLICY "cycles are publicly readable" ON "cycles" FOR SELECT USING (true);--> statement-breakpoint
DROP POLICY IF EXISTS "visible messages are publicly readable" ON "messages";--> statement-breakpoint
CREATE POLICY "visible messages are publicly readable" ON "messages" FOR SELECT USING ("deleted_at" IS NULL);--> statement-breakpoint
DROP POLICY IF EXISTS "authenticated users can post chat messages" ON "messages";--> statement-breakpoint
CREATE POLICY "authenticated users can post chat messages" ON "messages" FOR INSERT TO authenticated WITH CHECK (
  "author_type" = 'user'
  AND "author_id" = auth.uid()
  AND "deleted_at" IS NULL
  AND length(btrim("body")) BETWEEN 1 AND 800
  AND EXISTS (
    SELECT 1
    FROM "users"
    WHERE "users"."id" = auth.uid()
    AND "users"."banned_at" IS NULL
  )
  AND (
    "cycle_id" IS NULL
    OR EXISTS (
      SELECT 1
      FROM "cycles"
      WHERE "cycles"."id" = "messages"."cycle_id"
      AND "cycles"."status" = 'active'
    )
  )
);--> statement-breakpoint
ALTER TABLE "messages" REPLICA IDENTITY FULL;--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "messages";
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
