import type {
  RealtimePostgresInsertPayload,
  Session,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";
import {
  LogOut,
  Mail,
  MessageCircle,
  SendHorizontal,
  ShieldCheck,
  UserRound,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type ChatMessage,
  type ChatProfile,
  formatMessageTime,
  getMessageValidationError,
  type MessageRow,
  mergeMessages,
  normalizeMessageBody,
  profileFromEmail,
  toChatMessage,
  toChatProfile,
  type UserRow,
} from "../lib/community-chat";
import { getSupabaseBrowserClient } from "../lib/supabase";

const SAMPLE_MESSAGES: ChatMessage[] = [
  {
    id: "sample-system",
    authorType: "system",
    authorId: null,
    body: "Cycle zero is waiting for its first genre, name, and mechanic proposals.",
    createdAt: new Date("2026-07-06T18:00:00.000Z").toISOString(),
    cycleId: null,
  },
  {
    id: "sample-human",
    authorType: "user",
    authorId: "sample-user",
    body: "I want the first build to prove the archive loop before we add complicated rules.",
    createdAt: new Date("2026-07-06T18:04:00.000Z").toISOString(),
    cycleId: null,
  },
];

const SAMPLE_PROFILES: Record<string, ChatProfile> = {
  "sample-user": {
    id: "sample-user",
    handle: "founder-citizen",
    displayName: "Founder Citizen",
  },
};

type ConnectionState = "offline" | "connecting" | "live" | "degraded";

export function CommunityChat() {
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(
    supabase ? [] : SAMPLE_MESSAGES,
  );
  const [profiles, setProfiles] =
    useState<Record<string, ChatProfile>>(SAMPLE_PROFILES);
  const [connection, setConnection] = useState<ConnectionState>(
    supabase ? "connecting" : "offline",
  );
  const [notice, setNotice] = useState<string | null>(
    supabase ? null : "Live chat is not configured for this environment.",
  );
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const currentProfile = useMemo(() => {
    if (!session?.user.email) return null;
    return profileFromEmail(session.user.id, session.user.email);
  }, [session]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let cancelled = false;

    async function bootChat(activeClient: SupabaseClient) {
      setConnection("connecting");

      const {
        data: { session: initialSession },
      } = await activeClient.auth.getSession();
      if (cancelled) return;

      setSession(initialSession);
      if (initialSession?.user) {
        await ensureUserProfile(activeClient, initialSession.user);
      }
      await loadMessages(activeClient, setMessages, setProfiles);
      if (!cancelled) setConnection("live");
    }

    bootChat(client).catch((error: unknown) => {
      console.error(error);
      if (!cancelled) {
        setConnection("degraded");
        setNotice("Chat could not connect. Refresh once the service is ready.");
      }
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        ensureUserProfile(client, nextSession.user).catch((error: unknown) => {
          console.error(error);
          setNotice("Signed in, but the public profile could not be prepared.");
        });
      }
    });

    const channel = client
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: RealtimePostgresInsertPayload<MessageRow>) => {
          if (!payload.new || payload.new.deleted_at) return;
          const nextMessage = toChatMessage(payload.new);
          setMessages((current) => mergeMessages(current, nextMessage));
          if (nextMessage.authorId) {
            loadProfiles(client, [nextMessage.authorId], setProfiles).catch(
              (error: unknown) => console.error(error),
            );
          }
        },
      )
      .subscribe((state) => {
        if (state === "SUBSCRIBED") {
          setConnection("live");
          setNotice(null);
        }
        if (state === "CHANNEL_ERROR" || state === "TIMED_OUT") {
          setConnection("degraded");
          setNotice("Realtime updates paused. New messages appear on refresh.");
        }
      });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      void client.removeChannel(channel);
    };
  }, [supabase]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !email.trim()) return;

    setIsAuthBusy(true);
    setNotice(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    setIsAuthBusy(false);

    if (error) {
      setNotice("Magic link could not be sent. Check the email and try again.");
      return;
    }

    setNotice("Check your email for the Loome sign-in link.");
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
  }

  async function postMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !session?.user) return;

    const validationError = getMessageValidationError(body);
    if (validationError) {
      setNotice(validationError);
      return;
    }

    setIsPosting(true);
    setNotice(null);
    await ensureUserProfile(supabase, session.user);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        author_type: "user",
        author_id: session.user.id,
        body: normalizeMessageBody(body),
        cycle_id: null,
      })
      .select("id, cycle_id, author_type, author_id, body, created_at")
      .single();

    setIsPosting(false);

    if (error) {
      setNotice("Message was not posted. You may need to sign in again.");
      return;
    }

    if (data) {
      setMessages((current) =>
        mergeMessages(current, toChatMessage(data as MessageRow)),
      );
      setBody("");
    }
  }

  return (
    <section
      aria-label="Cycle zero chat"
      className="flex min-h-[38rem] flex-col rounded-lg border border-line bg-panel shadow-[0_24px_80px_rgb(0_0_0/0.28)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-line border-b px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md border border-line-strong bg-ink text-accent-alt">
            <MessageCircle aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-fg">Cycle zero chat</h2>
            <p className="text-muted text-sm">
              Public discussion for the first playable release.
            </p>
          </div>
        </div>
        <ConnectionBadge state={connection} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <div className="space-y-3">
          {connection === "connecting" && messages.length === 0 ? (
            <LoadingMessages />
          ) : (
            messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                profile={
                  message.authorId ? (profiles[message.authorId] ?? null) : null
                }
              />
            ))
          )}
        </div>
      </div>

      <div className="border-line border-t p-4 sm:p-5">
        {notice ? (
          <p
            className="mb-3 rounded-md border border-line bg-ink px-3 py-2 text-muted text-sm"
            role="status"
          >
            {notice}
          </p>
        ) : null}

        {session ? (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex min-w-0 items-center gap-2 text-muted">
              <UserRound
                aria-hidden="true"
                className="size-4 text-accent-alt"
              />
              <span className="truncate">
                Posting as{" "}
                <strong className="font-medium text-fg">
                  {currentProfile?.displayName ?? "Loome citizen"}
                </strong>
              </span>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 font-medium text-muted text-sm transition hover:border-line-strong hover:text-fg"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Sign out
            </button>
          </div>
        ) : (
          <form
            className="mb-3 flex flex-col gap-2 sm:flex-row"
            onSubmit={signIn}
          >
            <label className="min-w-0 flex-1">
              <span className="mb-1 block font-medium text-faint text-xs">
                Email address
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-11 w-full rounded-md border border-line bg-ink px-3 text-fg outline-none transition placeholder:text-faint focus:border-accent-alt"
                disabled={!supabase || isAuthBusy}
              />
            </label>
            <button
              type="submit"
              disabled={!supabase || isAuthBusy || !email.trim()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 font-semibold text-ink transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-muted sm:self-end"
            >
              <Mail aria-hidden="true" className="size-4" />
              Join chat
            </button>
          </form>
        )}

        <form className="flex gap-2" onSubmit={postMessage}>
          <label className="min-w-0 flex-1">
            <span className="mb-1 block font-medium text-faint text-xs">
              Message
            </span>
            <input
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={
                session ? "Add a cycle zero proposal" : "Sign in to post"
              }
              maxLength={800}
              disabled={!session || isPosting}
              className="h-12 w-full rounded-md border border-line bg-ink px-3 text-fg outline-none transition placeholder:text-faint focus:border-accent-alt disabled:cursor-not-allowed"
            />
          </label>
          <button
            type="submit"
            aria-label="Send message"
            disabled={!session || isPosting || !body.trim()}
            className="mt-6 grid h-12 w-12 shrink-0 place-items-center rounded-md bg-accent text-ink transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-muted"
          >
            <SendHorizontal aria-hidden="true" className="size-5" />
          </button>
        </form>
      </div>
    </section>
  );
}

function MessageItem({
  message,
  profile,
}: {
  message: ChatMessage;
  profile: ChatProfile | null;
}) {
  const author =
    message.authorType === "system"
      ? "Loome"
      : (profile?.displayName ??
        (message.authorType === "npc" ? "AI citizen" : "New citizen"));
  const badge =
    message.authorType === "system"
      ? "System"
      : message.authorType === "npc"
        ? "AI"
        : "Human";

  return (
    <article className="rounded-md border border-line bg-ink px-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium text-fg">{author}</span>
          <span className="rounded-sm border border-line-strong px-1.5 py-0.5 text-[0.7rem] text-faint">
            {badge}
          </span>
        </div>
        <time className="text-faint text-xs" dateTime={message.createdAt}>
          {formatMessageTime(message.createdAt)}
        </time>
      </div>
      <p className="mt-2 whitespace-pre-wrap break-words text-muted text-sm leading-6">
        {message.body}
      </p>
    </article>
  );
}

function ConnectionBadge({ state }: { state: ConnectionState }) {
  const isLive = state === "live";
  const isOffline = state === "offline";
  const Icon = isLive ? Wifi : isOffline ? WifiOff : ShieldCheck;
  const label = isLive ? "Live" : isOffline ? "Local" : "Syncing";

  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-line bg-ink px-3 py-2 text-muted text-sm">
      <Icon
        aria-hidden="true"
        className={isLive ? "size-4 text-accent-alt" : "size-4 text-faint"}
      />
      {label}
    </span>
  );
}

function LoadingMessages() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-24 animate-pulse rounded-md border border-line bg-ink"
        />
      ))}
    </>
  );
}

async function loadMessages(
  supabase: SupabaseClient,
  setMessages: (messages: ChatMessage[]) => void,
  setProfiles: Dispatch<SetStateAction<Record<string, ChatProfile>>>,
) {
  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, cycle_id, author_type, author_id, body, created_at, deleted_at",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) throw error;

  const rows = ((data ?? []) as MessageRow[]).reverse();
  setMessages(rows.map(toChatMessage));
  await loadProfiles(
    supabase,
    rows.flatMap((row) => (row.author_id ? [row.author_id] : [])),
    setProfiles,
  );
}

async function loadProfiles(
  supabase: SupabaseClient,
  userIds: string[],
  setProfiles: Dispatch<SetStateAction<Record<string, ChatProfile>>>,
) {
  const uniqueIds = [...new Set(userIds)];
  if (uniqueIds.length === 0) return;

  const { data, error } = await supabase
    .from("users")
    .select("id, handle, display_name")
    .in("id", uniqueIds);

  if (error) throw error;

  const nextProfiles = Object.fromEntries(
    ((data ?? []) as UserRow[]).map((row) => [row.id, toChatProfile(row)]),
  );
  setProfiles((current) => ({ ...current, ...nextProfiles }));
}

async function ensureUserProfile(supabase: SupabaseClient, user: User) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (data) return;

  const profile = profileFromEmail(user.id, user.email);
  const { error: insertError } = await supabase.from("users").insert({
    id: user.id,
    handle: profile.handle,
    display_name: profile.displayName,
  });

  if (insertError && insertError.code !== "23505") throw insertError;
}
