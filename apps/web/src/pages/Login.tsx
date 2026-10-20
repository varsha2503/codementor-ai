import { useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth";

const AUTH_HERO = "/auth-hero.jpg";

export function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  if (user) return <Navigate to="/" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="The judge decides. The coach explains."
      body="Write in C++, Python, or Java. Run the visible examples, submit the hidden suite, and climb the hint ladder. The model never gets to say your code passed."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Password" value={password} onChange={setPassword} type="password" />
        {error && <p className="text-sm text-bad">{error}</p>}
        <button className="w-full rounded-full bg-accent px-4 py-2.5 font-semibold text-black disabled:opacity-60" disabled={pending}>
          {pending ? "Signing in…" : "Enter the desk"}
        </button>
        <p className="text-sm text-muted">
          New here? <Link className="text-accent" to="/register">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { user, register } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  if (user) return <Navigate to="/" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await register(displayName, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="A private desk for the problems you are still missing."
      body="Your attempts, hints, and topic record stay on your account. Pick C++, Python, or Java — the runner stays isolated from the API."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Name" value={displayName} onChange={setDisplayName} />
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Password" value={password} onChange={setPassword} type="password" />
        {error && <p className="text-sm text-bad">{error}</p>}
        <button className="w-full rounded-full bg-accent px-4 py-2.5 font-semibold text-black disabled:opacity-60" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </button>
        <p className="text-sm text-muted">
          Already practicing? <Link className="text-accent" to="/login">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}

function AuthShell({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex flex-col justify-between border-b border-line px-8 py-10 lg:border-b-0 lg:border-r lg:px-14">
        <p className="font-serif text-2xl">CodeMentor</p>
        <div className="max-w-xl py-8 lg:py-12">
          <img
            alt=""
            className="mb-8 w-full max-w-lg rounded-2xl border border-line object-cover shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
            src={AUTH_HERO}
          />
          <h1 className="font-serif text-4xl leading-tight md:text-5xl">{title}</h1>
          <p className="mt-6 text-lg text-muted">{body}</p>
        </div>
        <p className="text-sm text-muted">C++ · Python · Java · visible runs · hidden submits · hint ladder</p>
      </section>
      <section className="flex items-center px-8 py-10 lg:px-14">
        <div className="w-full max-w-md rounded-3xl border border-line bg-panel p-6">{children}</div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-muted">{label}</span>
      <input
        className="w-full rounded-xl border border-line bg-panel2 px-3 py-2 outline-none ring-accent focus:ring-2"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      />
    </label>
  );
}
