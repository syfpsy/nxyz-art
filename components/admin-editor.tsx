"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Work, WorkTone } from "@/content/works";
import type { Product, ProductStatus } from "@/content/products";
import { gumletThumbnail } from "@/lib/video-thumb";
import { Mono } from "./mono";

/**
 * /admin editor. A single surface for works and products, backed by the
 * session-gated /api/admin/* routes. Edits live in state until saved; an
 * "unsaved changes" banner pins to the bottom so the writer can save or
 * discard without scrolling.
 */

type Tab = "works" | "products";

type LoadedData = {
  works: Work[];
  products: Product[];
};

type Session = {
  email: string;
  env: "dev" | "prod";
};

const WORK_TONES: WorkTone[] = ["light", "soft", "dark", "ui"];
const PRODUCT_STATUSES: ProductStatus[] = [
  "live",
  "public-beta",
  "private-beta",
  "coming-soon",
];

// =============================================================================
// Shell — session probe + login form OR the editor.
// =============================================================================

type ShellState =
  | { phase: "probing" }
  | { phase: "unauth" }
  | { phase: "authed"; session: Session }
  | { phase: "error"; error: string };

type AdminShellProps = {
  /**
   * Server-rendered starting state. When the page is rendered for an
   * authenticated user, this avoids a probing flicker; when rendered
   * for an anonymous user, it short-circuits straight to the login
   * form without a client round-trip.
   */
  initial?: ShellState;
};

export function AdminShell({ initial }: AdminShellProps = {}) {
  const [state, setState] = useState<ShellState>(
    initial ?? { phase: "probing" },
  );

  const probe = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      if (res.status === 401) {
        setState({ phase: "unauth" });
        return;
      }
      const json = (await res.json()) as {
        ok: boolean;
        email?: string;
        env?: "dev" | "prod";
        error?: string;
      };
      if (!json.ok || !json.email) {
        setState({ phase: "unauth" });
        return;
      }
      setState({
        phase: "authed",
        session: { email: json.email, env: json.env ?? "prod" },
      });
    } catch (err) {
      setState({ phase: "error", error: (err as Error).message });
    }
  }, []);

  useEffect(() => {
    // Only probe if we weren't given a server-rendered starting state.
    // Otherwise we trust the server probe and save a network round-trip.
    if (!initial) probe();
  }, [probe, initial]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    setState({ phase: "unauth" });
  };

  return (
    <>
      <AdminHeader
        state={state}
        onLogout={logout}
      />
      {state.phase === "probing" && <LoadingPanel />}
      {state.phase === "unauth" && <LoginForm onLoggedIn={probe} />}
      {state.phase === "error" && <ErrorPanel>{state.error}</ErrorPanel>}
      {state.phase === "authed" && <AdminEditor session={state.session} />}
    </>
  );
}

function AdminHeader({
  state,
  onLogout,
}: {
  state: ShellState;
  onLogout: () => void;
}) {
  const session = state.phase === "authed" ? state.session : null;
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        borderBottom: "1px solid var(--fg-primary)",
        paddingBottom: 14,
        marginBottom: 32,
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div>
        <span className="t-label" style={{ color: "var(--fg-tertiary)" }}>
          STUDIO · MAINTENANCE · {session?.env === "dev" ? "LOCAL" : "LIVE"}
        </span>
        <h1
          className="t-h1"
          style={{
            fontWeight: 500,
            marginTop: 6,
            letterSpacing: "-0.02em",
          }}
        >
          Content console
        </h1>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          whiteSpace: "nowrap",
        }}
      >
        {session ? (
          <>
            <Mono
              style={{
                color:
                  session.env === "dev" ? "var(--accent)" : "var(--fg-secondary)",
              }}
            >
              {session.env === "dev"
                ? "● DEV · DIRECT WRITES"
                : "◉ LIVE · GITHUB COMMIT"}
            </Mono>
            <Mono style={{ color: "var(--fg-tertiary)" }}>
              ◎ {session.email}
            </Mono>
            <button
              type="button"
              onClick={onLogout}
              style={{
                border: "1px solid var(--border-subtle)",
                background: "transparent",
                color: "var(--fg-secondary)",
                padding: "10px 16px",
                borderRadius: 999,
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                cursor: "pointer",
                minHeight: 36,
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <Mono style={{ color: "var(--fg-tertiary)" }}>○ SIGNED OUT</Mono>
        )}
      </div>
    </header>
  );
}

function LoginForm({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "err">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("err");
        setError(json.error ?? "Login failed.");
        return;
      }
      onLoggedIn();
    } catch (err) {
      setStatus("err");
      setError((err as Error).message);
    }
  };

  return (
    <form
      onSubmit={submit}
      style={{
        maxWidth: 420,
        margin: "48px auto 0",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        border: "1px solid var(--border-subtle)",
        borderRadius: 12,
        padding: 28,
        background: "var(--bg-elevated)",
      }}
    >
      <div>
        <Mono style={{ color: "var(--fg-tertiary)" }}>LOGIN · 01</Mono>
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: 22,
            letterSpacing: "-0.02em",
            marginTop: 4,
          }}
        >
          Sign in to edit.
        </h2>
      </div>
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Mono style={{ color: "var(--fg-tertiary)" }}>EMAIL</Mono>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting"}
          style={loginInputStyle}
        />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Mono style={{ color: "var(--fg-tertiary)" }}>PASSWORD</Mono>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={status === "submitting"}
          style={loginInputStyle}
        />
      </label>
      <button
        type="submit"
        disabled={status === "submitting"}
        style={{
          background: "var(--fg-primary)",
          color: "var(--bg-base)",
          border: 0,
          padding: "12px 16px",
          borderRadius: 8,
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          fontWeight: 500,
          cursor: status === "submitting" ? "default" : "pointer",
        }}
      >
        {status === "submitting" ? "Signing in…" : "Sign in ↵"}
      </button>
      {error && (
        <Mono style={{ color: "var(--status-urgent, #C73333)" }}>
          ! {error}
        </Mono>
      )}
      <Mono style={{ color: "var(--fg-tertiary)" }}>
        SESSION · 30 DAYS · HTTPONLY COOKIE
      </Mono>
    </form>
  );
}

const loginInputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  background: "var(--bg-base)",
  color: "var(--fg-primary)",
  fontFamily: "var(--font-sans)",
  fontSize: 15,
  outline: "none",
};

// =============================================================================
// Editor — the original CRUD surface, now session-aware.
// =============================================================================

function AdminEditor({ session }: { session: Session }) {
  const [tab, setTab] = useState<Tab>("works");
  const [data, setData] = useState<LoadedData | null>(null);
  const [baseline, setBaseline] = useState<LoadedData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initial load from /api/admin/data.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/data", { cache: "no-store" });
        const json = (await res.json()) as {
          ok: boolean;
          works?: Work[];
          products?: Product[];
          error?: string;
        };
        if (cancelled) return;
        if (!json.ok || !json.works || !json.products) {
          setLoadError(json.error ?? "Failed to load content.");
          return;
        }
        const fresh: LoadedData = { works: json.works, products: json.products };
        setData(fresh);
        // Deep-clone so the baseline is independent of the editable copy.
        setBaseline(JSON.parse(JSON.stringify(fresh)) as LoadedData);
      } catch (err) {
        if (!cancelled) setLoadError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = useMemo(() => {
    if (!data || !baseline) return false;
    return JSON.stringify(data) !== JSON.stringify(baseline);
  }, [data, baseline]);

  const [lastReceipt, setLastReceipt] = useState<{
    mode: "local" | "github";
    message: string;
    commitUrl?: string;
  } | null>(null);

  const save = useCallback(async () => {
    if (!data) return;
    // In production, confirm — a save costs a Vercel build. We don't want
    // muscle-memory ⌘S to burn build minutes.
    if (session.env === "prod") {
      const ok = window.confirm(
        "Save to live site?\n\nThis commits works.json and products.json to main and triggers a Vercel rebuild (~30s). Continue?",
      );
      if (!ok) return;
    }
    setSaveStatus("saving");
    setSaveError(null);
    setLastReceipt(null);
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        mode?: "local" | "github";
        message?: string;
        commitUrl?: string;
      };
      if (!res.ok || !json.ok) {
        setSaveStatus("err");
        setSaveError(json.error ?? "Save failed.");
        return;
      }
      setSaveStatus("ok");
      setBaseline(JSON.parse(JSON.stringify(data)) as LoadedData);
      if (json.mode) {
        setLastReceipt({
          mode: json.mode,
          message: json.message ?? "Saved.",
          commitUrl: json.commitUrl,
        });
      }
      window.setTimeout(() => setSaveStatus("idle"), 1800);
    } catch (err) {
      setSaveStatus("err");
      setSaveError((err as Error).message);
    }
  }, [data, session.env]);

  // Keep Ctrl/Cmd+S behaviour — muscle memory saves.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (dirty) save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, save]);

  const discard = () => {
    if (!baseline) return;
    setData(JSON.parse(JSON.stringify(baseline)) as LoadedData);
  };

  if (loadError) {
    return <ErrorPanel>Failed to load: {loadError}</ErrorPanel>;
  }

  if (!data) {
    return <LoadingPanel />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {lastReceipt && (
        <ReceiptBanner
          receipt={lastReceipt}
          onDismiss={() => setLastReceipt(null)}
        />
      )}

      <TabBar tab={tab} setTab={setTab} counts={data} />

      <div
        role="tabpanel"
        id="admin-tabpanel-works"
        aria-labelledby="admin-tab-works"
        hidden={tab !== "works"}
      >
        {tab === "works" && (
          <WorkList
            works={data.works}
            onChange={(works) => setData({ ...data, works })}
          />
        )}
      </div>
      <div
        role="tabpanel"
        id="admin-tabpanel-products"
        aria-labelledby="admin-tab-products"
        hidden={tab !== "products"}
      >
        {tab === "products" && (
          <ProductList
            products={data.products}
            onChange={(products) => setData({ ...data, products })}
          />
        )}
      </div>

      <SaveBar
        dirty={dirty}
        status={saveStatus}
        error={saveError}
        env={session.env}
        onSave={save}
        onDiscard={discard}
      />
    </div>
  );
}

function ReceiptBanner({
  receipt,
  onDismiss,
}: {
  receipt: {
    mode: "local" | "github";
    message: string;
    commitUrl?: string;
  };
  onDismiss: () => void;
}) {
  const isProd = receipt.mode === "github";
  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 18px",
        borderRadius: 10,
        background: isProd ? "#0F1115" : "var(--bg-elevated)",
        color: isProd ? "#F3F5F7" : "var(--fg-primary)",
        border: `1px solid ${isProd ? "#22252C" : "var(--border-subtle)"}`,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--accent)",
          boxShadow: "0 0 0 4px rgba(93, 63, 211, 0.22)",
          flexShrink: 0,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Mono style={{ color: isProd ? "rgba(243,245,247,0.62)" : "var(--fg-tertiary)" }}>
          {isProd ? "DISPATCHED · GITHUB" : "SAVED · LOCAL"}
        </Mono>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            letterSpacing: "-0.005em",
          }}
        >
          {receipt.message}
        </span>
      </div>
      <div style={{ flex: 1 }} />
      {receipt.commitUrl && (
        <a
          href={receipt.commitUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open GitHub commit in a new tab"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: isProd ? "#F3F5F7" : "var(--fg-primary)",
            textDecoration: "none",
            padding: "6px 10px",
            border: `1px solid ${isProd ? "rgba(243,245,247,0.22)" : "var(--border-subtle)"}`,
            borderRadius: 999,
          }}
        >
          ↗ commit
        </a>
      )}
      <button
        type="button"
        onClick={onDismiss}
        style={{
          background: "transparent",
          border: 0,
          color: isProd ? "rgba(243,245,247,0.62)" : "var(--fg-tertiary)",
          cursor: "pointer",
          fontFamily: "var(--font-mono)",
          fontSize: 14,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

// -------- Shell pieces ------------------------------------------------------

function TabBar({
  tab,
  setTab,
  counts,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  counts: LoadedData;
}) {
  const items: Array<{ id: Tab; label: string; count: number }> = [
    { id: "works", label: "Works", count: counts.works.length },
    { id: "products", label: "Products", count: counts.products.length },
  ];
  // Per APG tabs pattern with automatic activation: arrow keys select AND
  // move focus in one motion. We hold refs per tab so we can programmatically
  // shift focus after updating state — without this, the previously-selected
  // tab becomes tabIndex={-1} and focus falls out of the tablist.
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({
    works: null,
    products: null,
  });
  const activate = (next: Tab) => {
    setTab(next);
    // Defer focus so the re-render commits the new tabIndex first.
    window.requestAnimationFrame(() => {
      tabRefs.current[next]?.focus();
    });
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const order: Tab[] = items.map((i) => i.id);
    const current = order.indexOf(tab);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      activate(order[(current + 1) % order.length]);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      activate(order[(current - 1 + order.length) % order.length]);
    } else if (e.key === "Home") {
      e.preventDefault();
      activate(order[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      activate(order[order.length - 1]);
    }
  };
  return (
    <div
      role="tablist"
      aria-label="Admin content"
      onKeyDown={onKeyDown}
      style={{
        display: "flex",
        gap: 4,
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {items.map((it) => {
        const active = tab === it.id;
        return (
          <button
            key={it.id}
            ref={(el) => {
              tabRefs.current[it.id] = el;
            }}
            type="button"
            role="tab"
            id={`admin-tab-${it.id}`}
            aria-selected={active}
            aria-controls={`admin-tabpanel-${it.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => setTab(it.id)}
            style={{
              appearance: "none",
              background: active ? "var(--bg-elevated)" : "transparent",
              border: 0,
              borderBottom: `2px solid ${active ? "var(--fg-primary)" : "transparent"}`,
              padding: "12px 16px",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              color: active ? "var(--fg-primary)" : "var(--fg-secondary)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "baseline",
              gap: 8,
              marginBottom: -1,
              minHeight: 44,
            }}
          >
            <span style={{ fontWeight: 500 }}>{it.label}</span>
            <Mono style={{ color: "var(--fg-tertiary)" }}>{it.count}</Mono>
          </button>
        );
      })}
    </div>
  );
}

function SaveBar({
  dirty,
  status,
  error,
  env,
  onSave,
  onDiscard,
}: {
  dirty: boolean;
  status: "idle" | "saving" | "ok" | "err";
  error: string | null;
  env: "dev" | "prod";
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 16,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 14px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 999,
          boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
          minWidth: 320,
        }}
      >
        <Mono
          style={{
            color:
              status === "err"
                ? "var(--status-urgent, #C73333)"
                : dirty
                  ? "var(--accent)"
                  : "var(--fg-tertiary)",
          }}
        >
          {status === "saving"
            ? env === "prod"
              ? "COMMITTING…"
              : "SAVING…"
            : status === "err"
              ? "! ERROR"
              : status === "ok"
                ? env === "prod"
                  ? "✓ DISPATCHED"
                  : "✓ SAVED"
                : dirty
                  ? "● UNSAVED CHANGES"
                  : "○ CLEAN"}
        </Mono>
        {error && (
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              color: "var(--status-urgent, #C73333)",
              maxWidth: 340,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={error}
          >
            {error}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={onDiscard}
          disabled={!dirty}
          style={{
            background: "transparent",
            border: 0,
            padding: "6px 10px",
            color: dirty ? "var(--fg-secondary)" : "var(--fg-tertiary)",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            cursor: dirty ? "pointer" : "default",
          }}
        >
          Discard
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || status === "saving"}
          style={{
            background: dirty ? "var(--fg-primary)" : "var(--border-subtle)",
            color: "var(--bg-base)",
            border: 0,
            padding: "8px 14px",
            borderRadius: 999,
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 500,
            cursor: dirty ? "pointer" : "default",
          }}
        >
          {env === "prod" ? "Commit to live ⌘S" : "Save to disk ⌘S"}
        </button>
      </div>
    </div>
  );
}

function LoadingPanel() {
  return (
    <div
      style={{
        padding: 40,
        textAlign: "center",
        color: "var(--fg-tertiary)",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        letterSpacing: "0.14em",
      }}
    >
      LOADING…
    </div>
  );
}

function ErrorPanel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 24,
        border: "1px solid var(--status-urgent, #C73333)",
        color: "var(--status-urgent, #C73333)",
        borderRadius: 10,
        fontFamily: "var(--font-sans)",
        fontSize: 14,
      }}
    >
      {children}
    </div>
  );
}

// -------- Works editor ------------------------------------------------------

function WorkList({
  works,
  onChange,
}: {
  works: Work[];
  onChange: (next: Work[]) => void;
}) {
  const update = (i: number, patch: Partial<Work>) => {
    const next = works.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => {
    if (!window.confirm(`Delete work "${works[i].title}"?`)) return;
    onChange(works.filter((_, idx) => idx !== i));
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= works.length) return;
    const next = works.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => {
    const n = String(works.length + 1).padStart(2, "0");
    const fresh: Work = {
      slug: `new-work-${n}`,
      n,
      year: new Date().getFullYear(),
      title: "New work",
      kind: "Type system",
      tone: "light",
      role: [],
      summary: "A one-line editorial summary.",
    };
    onChange([...works, fresh]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {works.map((w, i) => (
        <WorkRow
          key={`${w.slug}-${i}`}
          index={i}
          total={works.length}
          work={w}
          onChange={(patch) => update(i, patch)}
          onMove={(dir) => move(i, dir)}
          onRemove={() => remove(i)}
        />
      ))}
      <AddButton onClick={add} label="+ Add work" />
    </div>
  );
}

function WorkRow({
  index,
  total,
  work,
  onChange,
  onMove,
  onRemove,
}: {
  index: number;
  total: number;
  work: Work;
  onChange: (patch: Partial<Work>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border-subtle)",
        borderRadius: 10,
        background: "var(--bg-elevated)",
      }}
    >
      <RowHeader
        index={index}
        total={total}
        badge={work.n}
        title={work.title}
        subtitle={`${work.kind} · ${work.year}`}
        onMove={onMove}
        onRemove={onRemove}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 14,
          padding: 16,
        }}
      >
        <Field label="Slug" span={3}>
          <Text value={work.slug} onChange={(v) => onChange({ slug: v })} />
        </Field>
        <Field label="Number" span={1}>
          <Text value={work.n} onChange={(v) => onChange({ n: v })} />
        </Field>
        <Field label="Year" span={2}>
          <Num
            value={work.year}
            onChange={(v) => onChange({ year: v })}
            min={1900}
            max={2100}
          />
        </Field>
        <Field label="Tone" span={2}>
          <Select
            value={work.tone}
            options={WORK_TONES}
            onChange={(v) => onChange({ tone: v as WorkTone })}
          />
        </Field>
        <Field label="Runtime" span={2}>
          <Text
            value={work.dur ?? ""}
            placeholder="00:00 (optional)"
            onChange={(v) => onChange({ dur: v || undefined })}
          />
        </Field>
        <Field label="Accent" span={2}>
          <Toggle
            value={work.accent ?? false}
            onChange={(v) => onChange({ accent: v })}
            label={work.accent ? "signature" : "standard"}
          />
        </Field>

        <Field label="Title" span={6}>
          <Text value={work.title} onChange={(v) => onChange({ title: v })} />
        </Field>
        <Field label="Kind" span={6}>
          <Text value={work.kind} onChange={(v) => onChange({ kind: v })} />
        </Field>

        <Field label="Client" span={6}>
          <Text
            value={work.client ?? ""}
            placeholder="optional"
            onChange={(v) => onChange({ client: v || undefined })}
          />
        </Field>
        <Field label="Role (comma separated)" span={6}>
          <Text
            value={work.role.join(", ")}
            onChange={(v) =>
              onChange({
                role: v
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </Field>

        <Field label="Summary (one line)" span={12}>
          <Area
            value={work.summary}
            onChange={(v) => onChange({ summary: v })}
            rows={2}
          />
        </Field>

        <Field label="Body (case study)" span={12}>
          <Area
            value={work.body ?? ""}
            onChange={(v) => onChange({ body: v || undefined })}
            rows={5}
            placeholder="optional long-form"
          />
        </Field>

        <Field label="HLS video" span={12}>
          <VideoField
            value={work.video ?? ""}
            title={work.title}
            onChange={(v) => onChange({ video: v || undefined })}
          />
        </Field>
      </div>
    </div>
  );
}

/**
 * Video field with a live poster preview.
 *
 * For Gumlet URLs we derive the auto-generated `thumbnail-1-0.png` and
 * show it at 16:9 next to the URL input. The preview degrades gracefully:
 *   - no URL -> a muted "no video" card
 *   - non-Gumlet URL -> an unknown-source card (we can't guess a thumb)
 *   - Gumlet URL but image 404s -> "poster unavailable" card with an
 *     "open in Gumlet" link the writer can follow to upload a still.
 */
function VideoField({
  value,
  title,
  onChange,
}: {
  value: string;
  title: string;
  onChange: (next: string) => void;
}) {
  const [imgError, setImgError] = useState(false);
  useEffect(() => {
    setImgError(false);
  }, [value]);

  const trimmed = value.trim();
  const thumb = gumletThumbnail(trimmed);
  const isGumlet = thumb !== null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(160px, 200px) 1fr",
        gap: 14,
        alignItems: "stretch",
      }}
    >
      <VideoThumb
        thumb={thumb}
        imgError={imgError}
        onImgError={() => setImgError(true)}
        hasUrl={trimmed.length > 0}
        isGumlet={isGumlet}
        title={title}
        videoUrl={trimmed}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Text
          value={value}
          placeholder="https://video.gumlet.io/.../main.m3u8 (optional)"
          onChange={onChange}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <Mono style={{ color: "var(--fg-tertiary)" }}>
            {trimmed.length === 0
              ? "No video attached."
              : isGumlet
                ? imgError
                  ? "GUMLET · POSTER MISSING"
                  : "GUMLET · POSTER AUTO"
                : "EXTERNAL · NO PREVIEW"}
          </Mono>
          {trimmed.length > 0 && (
            <a
              href={trimmed}
              target="_blank"
              rel="noreferrer"
              aria-label="Open video source URL in a new tab"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--fg-secondary)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              ↗ open source
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoThumb({
  thumb,
  imgError,
  onImgError,
  hasUrl,
  isGumlet,
  title,
  videoUrl,
}: {
  thumb: string | null;
  imgError: boolean;
  onImgError: () => void;
  hasUrl: boolean;
  isGumlet: boolean;
  title: string;
  videoUrl: string;
}) {
  const showImage = hasUrl && isGumlet && thumb && !imgError;

  return (
    <div
      style={{
        aspectRatio: "16 / 9",
        background: "var(--bg-base)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {showImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={thumb}
          alt={`Poster frame for ${title || "work"}`}
          onError={onImgError}
          loading="lazy"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <VideoThumbPlaceholder
          hasUrl={hasUrl}
          isGumlet={isGumlet}
          imgError={imgError}
          videoUrl={videoUrl}
        />
      )}
      {showImage && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 8,
            bottom: 8,
            padding: "3px 7px",
            borderRadius: 999,
            background: "rgba(15, 17, 21, 0.72)",
            color: "#F3F5F7",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Poster
        </span>
      )}
    </div>
  );
}

function VideoThumbPlaceholder({
  hasUrl,
  isGumlet,
  imgError,
  videoUrl,
}: {
  hasUrl: boolean;
  isGumlet: boolean;
  imgError: boolean;
  videoUrl: string;
}) {
  let label: string;
  let detail: string | null = null;
  if (!hasUrl) {
    label = "No video";
    detail = "Paste a Gumlet manifest URL to generate a poster.";
  } else if (!isGumlet) {
    label = "External source";
    detail = "Previews are only generated for Gumlet manifests.";
  } else if (imgError) {
    label = "Poster unavailable";
    detail = "Gumlet hasn't produced a thumbnail yet. Upload a still in the dashboard.";
  } else {
    label = "Loading…";
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 8,
        background:
          "repeating-linear-gradient(135deg, var(--bg-elevated) 0 10px, var(--bg-base) 10px 20px)",
      }}
    >
      <Mono style={{ color: "var(--fg-tertiary)" }}>
        {hasUrl ? (isGumlet && !imgError ? "◴" : "◌") : "◯"} {label}
      </Mono>
      {detail && (
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            lineHeight: 1.4,
            color: "var(--fg-tertiary)",
          }}
        >
          {detail}
        </span>
      )}
      {hasUrl && !isGumlet && (
        <a
          href={videoUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open video URL in a new tab"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--fg-secondary)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          ↗ open
        </a>
      )}
    </div>
  );
}

// -------- Products editor ---------------------------------------------------

function ProductList({
  products,
  onChange,
}: {
  products: Product[];
  onChange: (next: Product[]) => void;
}) {
  const update = (i: number, patch: Partial<Product>) => {
    const next = products.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => {
    if (!window.confirm(`Delete product "${products[i].name}"?`)) return;
    onChange(products.filter((_, idx) => idx !== i));
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= products.length) return;
    const next = products.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => {
    const n = String(products.length + 1).padStart(2, "0");
    const fresh: Product = {
      slug: `new-product-${n}`,
      n,
      name: "New Product",
      domain: "example.com",
      url: "https://example.com",
      year: new Date().getFullYear(),
      tagline: "One-line tagline.",
      summary: "A short two-to-three-sentence summary.",
      disciplines: [],
      status: "coming-soon",
      accent: "#6366F1",
    };
    onChange([...products, fresh]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {products.map((p, i) => (
        <ProductRow
          key={`${p.slug}-${i}`}
          index={i}
          total={products.length}
          product={p}
          onChange={(patch) => update(i, patch)}
          onMove={(dir) => move(i, dir)}
          onRemove={() => remove(i)}
        />
      ))}
      <AddButton onClick={add} label="+ Add product" />
    </div>
  );
}

function ProductRow({
  index,
  total,
  product,
  onChange,
  onMove,
  onRemove,
}: {
  index: number;
  total: number;
  product: Product;
  onChange: (patch: Partial<Product>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border-subtle)",
        borderRadius: 10,
        background: "var(--bg-elevated)",
      }}
    >
      <RowHeader
        index={index}
        total={total}
        badge={product.n}
        title={product.name}
        subtitle={`${product.domain} · ${product.status}`}
        accentDot={product.accent}
        onMove={onMove}
        onRemove={onRemove}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 14,
          padding: 16,
        }}
      >
        <Field label="Slug" span={3}>
          <Text value={product.slug} onChange={(v) => onChange({ slug: v })} />
        </Field>
        <Field label="Number" span={1}>
          <Text value={product.n} onChange={(v) => onChange({ n: v })} />
        </Field>
        <Field label="Year" span={2}>
          <Num value={product.year} onChange={(v) => onChange({ year: v })} />
        </Field>
        <Field label="Status" span={3}>
          <Select
            value={product.status}
            options={PRODUCT_STATUSES}
            onChange={(v) => onChange({ status: v as ProductStatus })}
          />
        </Field>
        <Field label="Accent (hex)" span={2}>
          <Hex
            value={product.accent}
            onChange={(v) => onChange({ accent: v })}
          />
        </Field>
        <Field label="Embed blocked" span={1}>
          <Toggle
            value={product.embedBlocked ?? false}
            onChange={(v) => onChange({ embedBlocked: v })}
            label={product.embedBlocked ? "yes" : "no"}
          />
        </Field>

        <Field label="Name" span={4}>
          <Text value={product.name} onChange={(v) => onChange({ name: v })} />
        </Field>
        <Field label="Domain" span={4}>
          <Text
            value={product.domain}
            onChange={(v) => onChange({ domain: v })}
          />
        </Field>
        <Field label="URL" span={4}>
          <Text value={product.url} onChange={(v) => onChange({ url: v })} />
        </Field>

        <Field label="Tagline" span={12}>
          <Text
            value={product.tagline}
            onChange={(v) => onChange({ tagline: v })}
          />
        </Field>
        <Field label="Summary" span={12}>
          <Area
            value={product.summary}
            onChange={(v) => onChange({ summary: v })}
            rows={4}
          />
        </Field>

        <Field label="Status note" span={6}>
          <Text
            value={product.statusNote ?? ""}
            placeholder="optional"
            onChange={(v) => onChange({ statusNote: v || undefined })}
          />
        </Field>
        <Field label="Pricing" span={6}>
          <Text
            value={product.pricing ?? ""}
            placeholder="optional"
            onChange={(v) => onChange({ pricing: v || undefined })}
          />
        </Field>
        <Field label="Disciplines (comma separated)" span={12}>
          <Text
            value={product.disciplines.join(", ")}
            onChange={(v) =>
              onChange({
                disciplines: v
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </Field>
        <Field label="Platforms (comma separated)" span={12}>
          <Text
            value={(product.platforms ?? []).join(", ")}
            onChange={(v) => {
              const arr = v
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              onChange({ platforms: arr.length ? arr : undefined });
            }}
          />
        </Field>
        <Field label="Features (one per line)" span={12}>
          <Area
            value={(product.features ?? []).join("\n")}
            onChange={(v) => {
              const arr = v
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean);
              onChange({ features: arr.length ? arr : undefined });
            }}
            rows={5}
          />
        </Field>
      </div>
    </div>
  );
}

// -------- Shared row header and field primitives ---------------------------

function RowHeader({
  index,
  total,
  badge,
  title,
  subtitle,
  accentDot,
  onMove,
  onRemove,
}: {
  index: number;
  total: number;
  badge: string;
  title: string;
  subtitle: string;
  accentDot?: string;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <Mono style={{ color: "var(--fg-tertiary)" }}>#{badge}</Mono>
      {accentDot && (
        <span
          aria-hidden
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: accentDot,
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: 15,
            letterSpacing: "-0.01em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </span>
        <Mono style={{ color: "var(--fg-secondary)" }}>{subtitle}</Mono>
      </div>
      <div style={{ flex: 1 }} />
      <IconBtn
        onClick={() => onMove(-1)}
        disabled={index === 0}
        label="Move up"
      >
        ↑
      </IconBtn>
      <IconBtn
        onClick={() => onMove(1)}
        disabled={index === total - 1}
        label="Move down"
      >
        ↓
      </IconBtn>
      <IconBtn onClick={onRemove} label="Delete" danger>
        ×
      </IconBtn>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  danger,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      style={{
        background: "transparent",
        border: "1px solid var(--border-subtle)",
        color: disabled
          ? "var(--fg-tertiary)"
          : danger
            ? "var(--status-urgent, #C73333)"
            : "var(--fg-secondary)",
        // Admin lives behind auth and has many tightly-packed controls, so
        // we meet WCAG 2.5.8 Minimum (24x24) comfortably at 32x32 rather
        // than inflating to 44x44 which would bloat every row header.
        width: 32,
        height: 32,
        borderRadius: 6,
        cursor: disabled ? "default" : "pointer",
        fontFamily: "var(--font-mono)",
        fontSize: 14,
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}

function AddButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        alignSelf: "flex-start",
        border: "1px dashed var(--border-subtle)",
        background: "transparent",
        color: "var(--fg-secondary)",
        padding: "10px 16px",
        borderRadius: 8,
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  span,
  children,
}: {
  label: string;
  span: number;
  children: React.ReactNode;
}) {
  return (
    <label
      className="admin-field"
      style={{
        gridColumn: `span ${span}`,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
      }}
    >
      <Mono style={{ color: "var(--fg-tertiary)" }}>{label}</Mono>
      {children}
    </label>
  );
}

const inputBase: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 10px",
  border: "1px solid var(--border-subtle)",
  borderRadius: 6,
  background: "var(--bg-base)",
  color: "var(--fg-primary)",
  fontFamily: "var(--font-sans)",
  fontSize: 13.5,
  lineHeight: 1.4,
  outline: "none",
};

function Text({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={inputBase}
    />
  );
}

function Num({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      style={inputBase}
    />
  );
}

function Area({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputBase, fontFamily: "var(--font-sans)", resize: "vertical" }}
    />
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={inputBase}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Hex({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        aria-label="Accent colour"
        style={{
          width: 34,
          height: 34,
          border: "1px solid var(--border-subtle)",
          borderRadius: 6,
          padding: 2,
          background: "var(--bg-base)",
          cursor: "pointer",
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputBase, fontFamily: "var(--font-mono)" }}
      />
    </div>
  );
}

function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        ...inputBase,
        cursor: "pointer",
        textAlign: "left",
        color: value ? "var(--accent)" : "var(--fg-secondary)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
      aria-pressed={value ? "true" : "false"}
    >
      {value ? "●" : "○"} {label}
    </button>
  );
}
