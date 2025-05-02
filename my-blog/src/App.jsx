import { A, Navigate, Route, Router } from "@solidjs/router";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { Show } from "solid-js";

import Home from "./pages/home.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignOut from "./pages/SignOut.jsx";
import SignUp from "./pages/SignUp.jsx";
import Error from "./pages/Error.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Router root={Layout}>
        <Route path="/" component={Home} />
        <Route path="/signin" component={SignIn} />
        <Route path="/signout" component={SignOut} />
        <Route path="/signup" component={SignUp} />
        <Route path="/error" component={Error} />
        <Route path="*" component={() => <Navigate href="/error" />} />
      </Router>
    </AuthProvider>
  );
}

function Layout(props) {
  const appName = import.meta.env.VITE_APP_NAME || "Osobni Blog";
  const auth = useAuth();

  return (
    <div class="min-h-screen flex flex-col bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="max-w-6xl mx-auto flex flex-row flex-wrap gap-2 items-center p-4">
          <div class="flex-none">
            <A class="text-3xl font-bold text-cyan-600" href="/">{appName}</A>
          </div>
          <nav class="flex-1 flex gap-3 justify-end items-center">
            <Show when={auth().user}>
              <span class="text-sm text-gray-600 mr-2">
                Dobrodošli, {auth().user.name || auth().user.email}
              </span>
              <A href="/signout" class="px-4 py-2 rounded text-white bg-pink-500 hover:bg-pink-600 transition">
                Odjava
              </A>
            </Show>
            <Show when={!auth().user}>
              <A href="/signin" class="px-4 py-2 rounded text-white bg-cyan-600 hover:bg-cyan-700 transition">
                Prijava
              </A>
              <A href="/signup" class="px-4 py-2 rounded text-white bg-amber-500 hover:bg-amber-600 transition">
                Registracija
              </A>
            </Show>
          </nav>
        </div>
      </header>

      <main class="flex-1 py-6">{props.children}</main>

      <footer class="py-6 px-4 bg-cyan-700 text-white text-sm text-center">
        <div class="max-w-6xl mx-auto">
          Copyright &copy; {new Date().getFullYear()} {appName} | Sva prava pridržana
        </div>
      </footer>
    </div>
  );
}
