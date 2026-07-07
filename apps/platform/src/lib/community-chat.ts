export const MESSAGE_MAX_LENGTH = 800;

export type AuthorType = "user" | "npc" | "system";

export type ChatMessage = {
  id: string;
  authorType: AuthorType;
  authorId: string | null;
  body: string;
  createdAt: string;
  cycleId: string | null;
};

export type ChatProfile = {
  id: string;
  handle: string;
  displayName: string;
};

export type MessageRow = {
  id: string;
  author_type: AuthorType;
  author_id: string | null;
  body: string;
  created_at: string;
  cycle_id: string | null;
  deleted_at?: string | null;
};

export type UserRow = {
  id: string;
  handle: string;
  display_name: string;
};

export function normalizeMessageBody(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function getMessageValidationError(input: string): string | null {
  const normalized = normalizeMessageBody(input);
  if (!normalized) return "Write a message before sending.";
  if (normalized.length > MESSAGE_MAX_LENGTH) {
    return `Messages must be ${MESSAGE_MAX_LENGTH} characters or fewer.`;
  }
  return null;
}

export function toChatMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    authorType: row.author_type,
    authorId: row.author_id,
    body: row.body,
    createdAt: row.created_at,
    cycleId: row.cycle_id,
  };
}

export function toChatProfile(row: UserRow): ChatProfile {
  return {
    id: row.id,
    handle: row.handle,
    displayName: row.display_name,
  };
}

export function mergeMessages(
  current: ChatMessage[],
  incoming: ChatMessage,
): ChatMessage[] {
  if (current.some((message) => message.id === incoming.id)) return current;

  return [...current, incoming]
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() -
        new Date(right.createdAt).getTime(),
    )
    .slice(-80);
}

export function profileFromEmail(
  userId: string,
  email: string | undefined,
): Omit<ChatProfile, "id"> {
  const localPart = email?.split("@")[0] ?? "citizen";
  const compact = localPart
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  const base = compact || "citizen";
  const suffix = userId.replace(/-/g, "").slice(0, 6);

  return {
    handle: `${base}-${suffix}`,
    displayName: titleCase(base.replace(/-/g, " ")),
  };
}

export function formatMessageTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
