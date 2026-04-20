"use client";

import { useId, useState } from "react";
import { Mono } from "./mono";

/**
 * Newsletter capture.
 *
 * Editorial rather than marketing — framed as a subscription to a press
 * sheet rather than "join our list". POSTs to /api/subscribe, which is
 * provider-agnostic. Success state reveals an editorial stamp that reads
 * "RECEIVED — filed under correspondence".
 */

type Status = "idle" | "submitting" | "success" | "error";

export type SubscribeVariant = "home" | "footer";

type SubscribeProps = {
  variant?: SubscribeVariant;
};

export function Subscribe({ variant = "home" }: SubscribeProps) {
  if (variant === "footer") return <SubscribeInline />;
  return <SubscribeSection />;
}

function SubscribeSection() {
  return (
    <section
      id="subscribe"
      aria-label="Subscribe — dispatches from the studio"
      style={{
        padding: "72px 24px",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        scrollMarginTop: 80,
      }}
    >
      <div
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: 48,
          alignItems: "start",
        }}
        className="subscribe-grid"
      >
        <div>
          <Mono style={{ color: "var(--fg-tertiary)" }}>
            DISPATCH · D · PRESS SHEET
          </Mono>
          <h2
            className="t-h2"
            style={{
              marginTop: 10,
              fontWeight: 500,
              maxWidth: 520,
              lineHeight: 1.08,
            }}
          >
            A short letter, a few times a year.
          </h2>
          <p
            className="t-body"
            style={{
              color: "var(--fg-secondary)",
              marginTop: 14,
              maxWidth: 440,
              fontSize: 15.5,
              lineHeight: 1.55,
            }}
          >
            One plain-text note per season: new work, a studio recipe,
            sometimes a quiet experiment. No tracking, no drip, no funnel.
          </p>
        </div>
        <SubscribeForm />
      </div>

      <style>{`
        @media (max-width: 820px) {
          .subscribe-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </section>
  );
}

function SubscribeInline() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 360,
      }}
    >
      <Mono style={{ color: "rgba(243,245,247,0.5)" }}>PRESS SHEET · DISPATCH</Mono>
      <SubscribeForm compact />
    </div>
  );
}

function SubscribeForm({ compact = false }: { compact?: boolean }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  const disabled = status === "submitting" || status === "success";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        alreadySubscribed?: boolean;
      };
      if (res.ok && data.ok) {
        setStatus("success");
        setMessage(
          data.alreadySubscribed
            ? "You're already on the list — thank you."
            : "Received. Filed under correspondence.",
        );
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Try again in a moment.");
      }
    } catch {
      setStatus("error");
      setMessage("Network hiccup. Try again in a moment.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "100%",
      }}
      aria-live="polite"
    >
      <label htmlFor={id} style={{ display: "none" }}>
        Email address
      </label>
      <div
        className={`subscribe-row ${status}`}
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 0,
          border: "1px solid var(--border-subtle)",
          borderRadius: 10,
          overflow: "hidden",
          background: compact ? "rgba(255,255,255,0.04)" : "var(--bg-elevated)",
          transition: "border-color var(--dur-base) var(--ease-standard)",
        }}
      >
        <input
          id={id}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="name@domain.tld"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={disabled}
          style={{
            flex: 1,
            minWidth: 0,
            padding: compact ? "10px 12px" : "14px 16px",
            border: 0,
            outline: "none",
            background: "transparent",
            fontFamily: "var(--font-sans)",
            fontSize: compact ? 14 : 15,
            color: compact ? "var(--fg-inverse)" : "var(--fg-primary)",
            letterSpacing: "-0.005em",
          }}
        />
        <button
          type="submit"
          disabled={disabled}
          style={{
            padding: compact ? "10px 14px" : "14px 20px",
            border: 0,
            borderLeft: "1px solid var(--border-subtle)",
            background: status === "success" ? "var(--accent)" : "var(--fg-primary)",
            color: "var(--bg-base)",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: compact ? 13 : 15,
            cursor: disabled ? "default" : "pointer",
            whiteSpace: "nowrap",
            transition:
              "background var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard)",
          }}
        >
          {status === "submitting"
            ? "Filing…"
            : status === "success"
              ? "✓ Received"
              : compact
                ? "Subscribe"
                : "Subscribe ↵"}
        </button>
      </div>

      <div
        style={{
          minHeight: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {status === "idle" && (
          <Mono style={{ color: compact ? "rgba(243,245,247,0.5)" : "var(--fg-tertiary)" }}>
            NO SPAM · UNSUBSCRIBE IN ONE CLICK
          </Mono>
        )}
        {status === "submitting" && (
          <Mono style={{ color: "var(--fg-tertiary)" }}>SIGNING…</Mono>
        )}
        {status === "success" && (
          <Stamp>{message}</Stamp>
        )}
        {status === "error" && (
          <Mono style={{ color: "var(--status-urgent, #C73333)" }}>
            ! {message}
          </Mono>
        )}
      </div>
    </form>
  );
}

/**
 * A postmark-ish stamp that appears on successful submission. Rotated a
 * touch, dotted border, uppercase mono — it reads like a hand-stamped note.
 */
function Stamp({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 10px",
        border: "1px dashed var(--accent)",
        borderRadius: 4,
        transform: "rotate(-1.5deg)",
        fontFamily: "var(--font-mono)",
        fontSize: 10.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--accent)",
        animation: "stamp-drop 320ms var(--ease-standard) both",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--accent)",
        }}
      />
      {children}
      <style>{`
        @keyframes stamp-drop {
          from { transform: rotate(-8deg) scale(1.1); opacity: 0; }
          to   { transform: rotate(-1.5deg) scale(1); opacity: 1; }
        }
      `}</style>
    </span>
  );
}
