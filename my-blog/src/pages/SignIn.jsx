// src/pages/SignIn.jsx
import { createSignal } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { useAuth } from "../components/AuthProvider";

export default function SignIn() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email() || !password()) {
      setError("Molimo unesite email i lozinku");
      return;
    }

    setLoading(true);
    try {
      await auth.login(email(), password());
      navigate("/");
    } catch (err) {
      console.error("Greška pri prijavi:", err);
      setError("Neispravni podaci za prijavu. Provjerite email i lozinku.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="mt-10 text-center text-2xl font-bold leading-9 text-gray-900">
          Prijava u račun
        </h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {error() && (
          <div class="mb-4 p-3 text-sm bg-red-100 border border-red-400 text-red-700 rounded">
            {error()}
          </div>
        )}

        <form class="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label for="email" class="block text-sm font-medium leading-6 text-gray-900">
              Email adresa
            </label>
            <div class="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                value={email()}
                onInput={(e) => setEmail(e.target.value)}
                class="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-cyan-600"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm font-medium leading-6 text-gray-900">
                Lozinka
              </label>
            </div>
            <div class="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                value={password()}
                onInput={(e) => setPassword(e.target.value)}
                class="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-cyan-600"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading()}
              class="flex w-full justify-center rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 disabled:opacity-50"
            >
              {loading() ? "Molimo pričekajte..." : "Prijavi se"}
            </button>
          </div>
        </form>

        <p class="mt-10 text-center text-sm text-gray-500">
          Nemaš račun?{" "}
          <A href="/signup" class="font-semibold leading-6 text-cyan-600 hover:text-cyan-500">
            Registriraj se
          </A>
        </p>
      </div>
    </div>
  );
}
