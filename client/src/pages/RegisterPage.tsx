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
      // od razu logujemy usera po udanej rejestracji, żeby nie musiał wpisywać danych drugi raz
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Zarejestruj się</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white rounded px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Rejestracja..." : "Zarejestruj się"}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          Masz już konto?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
};