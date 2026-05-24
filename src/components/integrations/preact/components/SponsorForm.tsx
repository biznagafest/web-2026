import { Spinner } from "./utils/Spinner";
import { useForm } from "../hooks/use-form";

export default function SponsorForm({ className }: { className?: string }) {
  const { state, status, updateFormProperty, setStatus, clearForm } = useForm({
    name: "",
    email: "",
    message: "",
  });

  const submitForm = async (e: SubmitEvent) => {
    e.preventDefault();
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
      });
  };

  const inputClass =
    "rounded-sm p-3 bg-surface-card border border-border text-text-primary placeholder:text-text-primary/40 focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow";
  const labelClass =
    "font-display text-[10px] uppercase tracking-pixel text-text-secondary";

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
          onChange={(e) => updateFormProperty("message", e.currentTarget.value)}
        />
      </div>
      <button
        className={`self-center md:self-start inline-flex items-center justify-center rounded-sm px-8 py-3 font-sans text-sm font-semibold uppercase tracking-wide text-white transition-colors ${
          status === "loading"
            ? "bg-action-primary/50 cursor-not-allowed"
            : "bg-action-primary hover:bg-action-primary-hover cursor-pointer"
        }`}
        type="submit"
        data-umami-event="sponsor_form_submit"
        disabled={status === "loading"}
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
