"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { buildCommandIndex, type CommandItem } from "@/lib/command-index";

const KIND_LABEL: Record<CommandItem["kind"], string> = {
  page: "page",
  work: "work",
  product: "shop",
  lab: "lab",
  writing: "read",
  action: "cmd",
};

type Props = {
  /** If true, render the inline trigger (the fake search input in the nav).
   *  The overlay portal is always rendered; open it via ⌘K or the trigger. */
  renderTrigger?: boolean;
};

export function CommandBar({ renderTrigger = true }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const index = useMemo(buildCommandIndex, []);

  const results = useMemo(() => {
    if (!q.trim()) return index.slice(0, 12);
    const needle = q.toLowerCase();
    return index
      .filter(
        (r) =>
          r.label.toLowerCase().includes(needle) ||
          r.kind.toLowerCase().includes(needle) ||
          (r.hint ?? "").toLowerCase().includes(needle),
      )
      .slice(0, 20);
  }, [q, index]);

  // Global hotkeys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmd = e.metaKey || e.ctrlKey;
      if (cmd && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus input when opened.
  useEffect(() => {
    if (open) {
      setActive(0);
      // defer so the node is painted before focusing
      const t = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(t);
    } else {
      setQ("");
    }
  }, [open]);

  const go = useCallback(
    (item: CommandItem) => {
      setOpen(false);
      if (item.href) {
        if (item.href.startsWith("mailto:") || item.href.startsWith("http")) {
          window.location.href = item.href;
        } else {
          router.push(item.href);
        }
      } else if (item.action) {
        item.action();
      }
    },
    [router],
  );

  const onKeyDownList = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[active];
      if (item) go(item);
    }
  };

  return (
    <>
      {renderTrigger && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open command bar"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            borderRadius: 10,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            color: "var(--fg-tertiary)",
            textAlign: "left",
            cursor: "pointer",
            transition: "all var(--dur-base) var(--ease-standard)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border-strong)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
        >
          <span
            className="t-mono"
            style={{ color: "var(--fg-tertiary)", fontSize: 12 }}
          >
            {">"}
          </span>
          <span
            className="t-mono"
            style={{
              flex: 1,
              color: "var(--fg-tertiary)",
              fontSize: 12,
              letterSpacing: "0.02em",
            }}
          >
            search work · run command · jump to —
          </span>
          <Kbd>⌘K</Kbd>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(17,18,20,0.32)",
            backdropFilter: "blur(6px) saturate(1.1)",
            WebkitBackdropFilter: "blur(6px) saturate(1.1)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "min(18vh, 160px)",
            animation: "nxyz-fade var(--dur-base) var(--ease-standard)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(640px, calc(100vw - 32px))",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              boxShadow: "var(--shadow-3)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 18px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <span
                className="t-mono"
                style={{ color: "var(--fg-tertiary)", fontSize: 12 }}
              >
                {">"}
              </span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDownList}
                placeholder="search work · run command · jump to —"
                style={{
                  flex: 1,
                  border: 0,
                  outline: "none",
                  background: "transparent",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  letterSpacing: "0.02em",
                  color: "var(--fg-primary)",
                }}
              />
              <Kbd>esc</Kbd>
            </div>

            <div
              ref={listRef}
              style={{
                maxHeight: "48vh",
                overflowY: "auto",
                padding: 6,
              }}
            >
              {results.length === 0 ? (
                <div
                  className="t-mono"
                  style={{
                    padding: "18px 14px",
                    color: "var(--fg-tertiary)",
                    fontSize: 12,
                  }}
                >
                  nothing matches · press esc to close
                </div>
              ) : (
                results.map((r, i) => (
                  <button
                    key={r.id}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      background: i === active ? "var(--bg-sunken)" : "transparent",
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--fg-primary)",
                      textAlign: "left",
                      transition: "background var(--dur-fast) var(--ease-standard)",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--fg-tertiary)",
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        minWidth: 40,
                      }}
                    >
                      {KIND_LABEL[r.kind]}
                    </span>
                    <span style={{ flex: 1 }}>{r.label}</span>
                    {r.hint && (
                      <span style={{ color: "var(--fg-tertiary)" }}>{r.hint}</span>
                    )}
                    <span style={{ color: "var(--fg-tertiary)" }}>↵</span>
                  </button>
                ))
              )}
            </div>

            <div
              className="t-mono"
              style={{
                display: "flex",
                gap: 14,
                padding: "10px 18px",
                borderTop: "1px solid var(--border-subtle)",
                color: "var(--fg-tertiary)",
                fontSize: 10,
              }}
            >
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
              <span style={{ marginLeft: "auto" }}>
                {results.length} result{results.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.08em",
        color: "var(--fg-tertiary)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 4,
        padding: "2px 6px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
