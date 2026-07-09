import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["member", "moderator", "admin"]);

/** Platform users. `id` mirrors the auth provider's user id. */
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  handle: text("handle").notNull().unique(),
  displayName: text("display_name").notNull(),
  role: userRole("role").notNull().default("member"),
  bannedAt: timestamp("banned_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const npcStatus = pgEnum("npc_status", ["active", "paused"]);

/** AI community members. Always displayed with an AI badge. */
export const npcs = pgTable("npcs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  /** Structured personality definition (tone, interests, quirks). */
  personality: jsonb("personality").notNull(),
  status: npcStatus("status").notNull().default("active"),
  /** Voting weight; decays as human participation grows (brief §18). */
  voteWeight: numeric("vote_weight", { precision: 4, scale: 2 })
    .notNull()
    .default("1.00"),
  dailyTokenBudget: integer("daily_token_budget").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const cyclePhase = pgEnum("cycle_phase", [
  "play",
  "synthesize",
  "vote",
  "implement",
  "deploy",
  "archive",
]);

export const cycleStatus = pgEnum("cycle_status", [
  "active",
  "completed",
  "aborted",
]);

/** One community governance cycle (brief §17). */
export const cycles = pgTable("cycles", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: integer("number").notNull().unique(),
  phase: cyclePhase("phase").notNull().default("play"),
  status: cycleStatus("status").notNull().default("active"),
  phaseEndsAt: timestamp("phase_ends_at", { withTimezone: true }),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const authorType = pgEnum("author_type", ["user", "npc", "system"]);

/** Community chat. Content is sanitized before render (SR10). */
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cycleId: uuid("cycle_id").references(() => cycles.id),
    authorType: authorType("author_type").notNull(),
    /** users.id or npcs.id depending on authorType; null for system. */
    authorId: uuid("author_id"),
    body: text("body").notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("messages_cycle_created_idx").on(table.cycleId, table.createdAt),
  ],
);

export const proposalKind = pgEnum("proposal_kind", ["feature", "revert"]);

export const proposalStatus = pgEnum("proposal_status", [
  "candidate",
  "vetoed",
  "winner",
  "rejected",
]);

/** Sanitized proposal candidates produced by the synthesizer. */
export const proposals = pgTable("proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  cycleId: uuid("cycle_id")
    .notNull()
    .references(() => cycles.id),
  kind: proposalKind("kind").notNull().default("feature"),
  status: proposalStatus("status").notNull().default("candidate"),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  /** Implementation brief (validated by @loome/shared schema) once winner. */
  brief: jsonb("brief"),
  vetoedBy: uuid("vetoed_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const voterType = pgEnum("voter_type", ["user", "npc"]);

/** Weighted votes; one per voter per cycle (SR8). */
export const votes = pgTable(
  "votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cycleId: uuid("cycle_id")
      .notNull()
      .references(() => cycles.id),
    proposalId: uuid("proposal_id")
      .notNull()
      .references(() => proposals.id),
    voterType: voterType("voter_type").notNull(),
    voterId: uuid("voter_id").notNull(),
    /** Weight snapshot at vote time; NPC weight decays over time. */
    weight: numeric("weight", { precision: 4, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("votes_one_per_voter_idx").on(
      table.cycleId,
      table.voterType,
      table.voterId,
    ),
  ],
);

export const runState = pgEnum("run_state", [
  "queued",
  "working",
  "delivered",
  "failed",
]);

/**
 * Implementation runs. `backendRunId` is private infrastructure data and
 * must never be returned by public APIs; public surfaces use `publicRunId`
 * and the sanitized `events` list only (D8).
 */
export const agentRuns = pgTable("agent_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  cycleId: uuid("cycle_id")
    .notNull()
    .references(() => cycles.id),
  proposalId: uuid("proposal_id")
    .notNull()
    .references(() => proposals.id),
  publicRunId: text("public_run_id").notNull().unique(),
  backendRunId: text("backend_run_id").notNull(),
  state: runState("state").notNull().default("queued"),
  /**
   * Sanitized PublicRunEventRecord list (closed-enum type + optional public
   * screenshot url) from @loome/shared. jsonb, so the entry shape can carry
   * artifacts without a column migration.
   */
  events: jsonb("events").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Operational settings (NPC budgets, phase durations, feature flags). */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Append-only audit trail for moderation/veto/kill/release actions (SR9). */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorType: authorType("actor_type").notNull(),
    actorId: uuid("actor_id"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    details: jsonb("details"),
    isSystem: boolean("is_system").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("audit_log_created_idx").on(table.createdAt)],
);
