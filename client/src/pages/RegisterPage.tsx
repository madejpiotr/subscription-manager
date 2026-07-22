import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await registerUser(email, password);
      const data = await loginUser(email, password);
      login(data.token);
      navigate("/");
    } catch (err: any) {
      const message = err.response?.data?.error || "Coś poszło nie tak";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-1">
            Panel subskrypcji
          </p>
          <h1 className="font-display text-2xl font-bold">Załóż konto</h1>
        </div>

        <div className="relative ticket-notch bg-surface border border-border rounded-lg p-8">
          <div className="ticket-accent-line top-4" />
          <div className="ticket-accent-line bottom-4" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <div>
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-wider block mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-bg border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-text-muted uppercase tracking-wider block mb-1">
                Hasło
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-bg border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
              <p className="font-mono text-[10px] text-text-muted mt-1">min. 8 znaków</p>
            </div>

            {error && <p className="text-danger text-xs font-mono">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="bg-accent text-bg font-mono text-sm font-medium rounded px-4 py-2 hover:bg-accent-dim transition disabled:opacity-50 mt-2"
            >
              {isLoading ? "Rejestracja..." : "Zarejestruj się"}
            </button>
          </form>
        </div>

        <p className="text-sm text-center mt-6 text-text-muted font-mono">
          Masz już konto?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
};