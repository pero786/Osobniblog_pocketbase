import { A, Navigate, Route, Router } from "@solidjs/router";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { Show } from "solid-js";

import Home from "./pages/home.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignOut from "./pages/SignOut.jsx";
import SignUp from "./pages/SignUp.jsx";
import Error from "./pages/Error.jsx";
import CreatePost from "./components/CreatePost.jsx";
import EditPost from "./components/EditPost.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Router root={Layout}>
        <Route path="/" component={Home} />
        <Route path="/signin" component={SignIn} />
        <Route path="/signout" component={SignOut} />
        <Route path="/signup" component={SignUp} />
        <Route path="/create" component={CreatePost} />
        <Route path="/edit/:id" component={EditPost} />
        <Route path="/error" component={Error} />
        <Route path="*" component={() => <Navigate href="/error" />} />
      </Router>
    </AuthProvider>
  );
}

function Layout(props) {
  const appName = import.meta.env.VITE_APP_NAME || "Osobni Blog";
  const user = useAuth();

  return (
    <div class="min-h-screen flex flex-col">
      <header class="flex flex-row flex-wrap gap-2 items-center p-2 flex-none">
        <div class="flex-none">
          <A class="text-4xl font-bold font-sans uppercase text-cyan-600" href="/">{appName}</A>
        </div>
        
        <Show when={user()}>
          <div class="flex-1 flex items-center justify-center">
            <div class="bg-cyan-50 px-3 py-1 rounded-full text-cyan-800 border border-cyan-200">
              <span>Korisnik: {user().name || user().email}</span>
            </div>
          </div>
        </Show>
        
        <nav class="flex-1 flex gap-2 justify-end">
          <Show when={user()}>
            <A href="/signout" class="px-4 py-2 rounded text-white bg-pink-500 hover:bg-pink-600 transition">
              Odjava
            </A>
          </Show>
        </nav>
      </header>

      <main class="flex-1">{props.children}</main>

      <footer class="flex-none py-6 px-2 bg-cyan-700 text-white text-sm text-center">
        Copyright &copy; {new Date().getFullYear()} {appName}
      </footer>
    </div>
  );
}
