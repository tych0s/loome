CREATE TYPE "public"."author_type" AS ENUM('user', 'npc', 'system');--> statement-breakpoint
CREATE TYPE "public"."cycle_phase" AS ENUM('play', 'synthesize', 'vote', 'implement', 'deploy', 'archive');--> statement-breakpoint
CREATE TYPE "public"."cycle_status" AS ENUM('active', 'completed', 'aborted');--> statement-breakpoint
CREATE TYPE "public"."npc_status" AS ENUM('active', 'paused');--> statement-breakpoint
CREATE TYPE "public"."proposal_kind" AS ENUM('feature', 'revert');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('candidate', 'vetoed', 'winner', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."run_state" AS ENUM('queued', 'working', 'delivered', 'failed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('member', 'moderator', 'admin');--> statement-breakpoint
CREATE TYPE "public"."voter_type" AS ENUM('user', 'npc');--> statement-breakpoint
CREATE TABLE "agent_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" uuid NOT NULL,
	"proposal_id" uuid NOT NULL,
	"public_run_id" text NOT NULL,
	"backend_run_id" text NOT NULL,
	"state" "run_state" DEFAULT 'queued' NOT NULL,
	"events" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agent_runs_public_run_id_unique" UNIQUE("public_run_id")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_type" "author_type" NOT NULL,
	"actor_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"details" jsonb,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" integer NOT NULL,
	"phase" "cycle_phase" DEFAULT 'play' NOT NULL,
	"status" "cycle_status" DEFAULT 'active' NOT NULL,
	"phase_ends_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "cycles_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" uuid,
	"author_type" "author_type" NOT NULL,
	"author_id" uuid,
	"body" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "npcs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"personality" jsonb NOT NULL,
	"status" "npc_status" DEFAULT 'active' NOT NULL,
	"vote_weight" numeric(4, 2) DEFAULT '1.00' NOT NULL,
	"daily_token_budget" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "npcs_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" uuid NOT NULL,
	"kind" "proposal_kind" DEFAULT 'feature' NOT NULL,
	"status" "proposal_status" DEFAULT 'candidate' NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"brief" jsonb,
	"vetoed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"handle" text NOT NULL,
	"display_name" text NOT NULL,
	"role" "user_role" DEFAULT 'member' NOT NULL,
	"banned_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" uuid NOT NULL,
	"proposal_id" uuid NOT NULL,
	"voter_type" "voter_type" NOT NULL,
	"voter_id" uuid NOT NULL,
	"weight" numeric(4, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_cycle_id_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_cycle_id_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_cycle_id_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_vetoed_by_users_id_fk" FOREIGN KEY ("vetoed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_cycle_id_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_created_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "messages_cycle_created_idx" ON "messages" USING btree ("cycle_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "votes_one_per_voter_idx" ON "votes" USING btree ("cycle_id","voter_type","voter_id");