import { createSignal, onMount, Show } from "solid-js";
import { useAuth } from "../components/AuthProvider";
import { pb } from "../services/pocketbase";
import { A } from "@solidjs/router";

export default function Home() {
  // Get auth with optional chaining or fallback
  const auth = useAuth();
  const [loading, setLoading] = createSignal(true);

  onMount(() => {
    setLoading(false);
  });

  // Component for guest users
  const GuestView = () => (
    <div class="bg-gradient-to-br from-cyan-100 to-blue-200 rounded-lg p-8 shadow-md">
      <h1 class="text-4xl font-bold text-cyan-800 mb-4">Dobrodošli na Osobni Blog!</h1>
      <p class="text-lg text-cyan-700 mb-6">
        Platforma za kreiranje i dijeljenje osobnih blogova.
      </p>
      <div class="flex gap-4 mt-8">
        <A href="/signin" class="px-6 py-3 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition shadow-md">
          Prijavi se
        </A>
        <A href="/signup" class="px-6 py-3 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition shadow-md">
          Registriraj se
        </A>
      </div>
    </div>
  );

  // Component for logged-in users
  const UserView = () => (
    <div class="bg-white rounded-lg p-8 shadow-md">
      <h1 class="text-3xl font-bold text-cyan-700 mb-4">
        Dobrodošli natrag, {auth?.() ? auth().name || auth().email : "korisniče"}!
      </h1>
      <p class="text-lg text-gray-600 mb-6">
        Uspješno ste prijavljeni u svoj račun.
      </p>
      <A href="/signout" class="px-6 py-3 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition shadow-md inline-block">
        Odjava
      </A>
    </div>
  );

  return (
    <div class="max-w-3xl mx-auto p-4">
      <Show when={!loading()}>
        {/* Use optional check for auth() */}
        <Show when={auth && auth()} fallback={<GuestView />}>
          <UserView />
        </Show>
      </Show>
      
      <Show when={loading()}>
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-600"></div>
          <span class="ml-3 text-gray-600">Učitavanje...</span>
        </div>
      </Show>
    </div>
  );
}
