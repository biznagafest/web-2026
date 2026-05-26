import { useEffect, useRef, useState } from "preact/hooks";
import { TURNSTILE_SITE_KEY } from "astro:env/client";
import { Spinner } from "./utils/Spinner";
import { useForm } from "../hooks/use-form";

type TurnstileRenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  theme?: "auto" | "light" | "dark";
  action?: string;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: TurnstileRenderOptions,
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${TURNSTILE_SCRIPT_SRC}"]`,
  );
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("turnstile script failed to load")),
        { once: true },
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("turnstile script failed to load")),
      { once: true },
    );
    document.head.appendChild(script);
  });
}

export default function SponsorForm({ className }: { className?: string }) {
  const { state, status, updateFormProperty, setStatus, clearForm } = useForm({
    name: "",
    email: "",
    message: "",
  });

  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [turnstileReady, setTurnstileReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled) return;
        if (!window.turnstile || !turnstileContainerRef.current) return;
        widgetIdRef.current = window.turnstile.render(
          turnstileContainerRef.current,
          {
            sitekey: TURNSTILE_SITE_KEY,
            theme: "auto",
            callback: (token) => setTurnstileToken(token),
            "error-callback": () => setTurnstileToken(""),
            "expired-callback": () => setTurnstileToken(""),
          },
        );
        setTurnstileReady(true);
      })
      .catch((err) => {
        console.error("[SponsorForm] turnstile load failed", err);
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  const resetTurnstile = () => {
    setTurnstileToken("");
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  const submitForm = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    const formData = new FormData(e.target as HTMLFormElement);
    await fetch("/api/sponsor-contact", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          setStatus("error");
          throw new Error("Network response was not ok");
        }
        setStatus("success");
        clearForm();
        return res.json();
      })
      .catch((err) => {
        setStatus("error");
        console.error("There was a problem with the fetch operation:", err);
      })
      .finally(() => {
        resetTurnstile();
      });
  };

  const inputClass =
    "rounded-sm p-3 bg-surface-card border border-border text-text-primary placeholder:text-text-primary/40 focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow";
  const labelClass =
    "font-display text-[10px] uppercase tracking-pixel text-text-secondary";

  const isSubmitDisabled =
    status === "loading" || !turnstileReady || !turnstileToken;

  return (
    <form className={className} onSubmit={submitForm}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sponsorFormName" className={labelClass}>
          Name
        </label>
        <input
          className={inputClass}
          type="text"
          id="sponsorFormName"
          name="name"
          required
          value={state.name}
          onChange={(e) => updateFormProperty("name", e.currentTarget.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="sponsorFormEmail" className={labelClass}>
          Email
        </label>
        <input
          className={inputClass}
          type="email"
          id="sponsorFormEmail"
          name="email"
          required
          value={state.email}
          onChange={(e) => updateFormProperty("email", e.currentTarget.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="sponsorFormMessage" className={labelClass}>
          Message
        </label>
        <textarea
          className={`${inputClass} resize-none min-h-40`}
          id="sponsorFormMessage"
          name="message"
          required
          value={state.message}
          onChange={(e) =>
            updateFormProperty("message", e.currentTarget.value)
          }
        />
      </div>

      <div ref={turnstileContainerRef} className="self-center md:self-start" />

      <button
        className={`self-center md:self-start inline-flex items-center justify-center rounded-sm px-8 py-3 font-sans text-sm font-semibold uppercase tracking-wide text-white transition-colors ${
          isSubmitDisabled
            ? "bg-action-primary/50 cursor-not-allowed"
            : "bg-action-primary hover:bg-action-primary-hover cursor-pointer"
        }`}
        type="submit"
        data-umami-event="sponsor_form_submit"
        disabled={isSubmitDisabled}
      >
        {status === "loading" ? (
          <div class="grid place-items-center">
            <Spinner className="fill-white" />
          </div>
        ) : (
          "Enviar"
        )}
      </button>
      {status === "error" && (
        <p className="text-accent-red text-sm mt-2">
          Ha ocurrido un error al enviar el mensaje. Por favor, inténtalo de
          nuevo más tarde.
        </p>
      )}
      {status === "success" && (
        <p className="text-accent-yellow text-sm mt-2">
          ¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.
        </p>
      )}
    </form>
  );
}
