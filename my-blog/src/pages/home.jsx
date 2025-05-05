import { createSignal, onMount, For, Show } from "solid-js";
import { useAuth } from "../components/AuthProvider";
import { pb } from "../services/pocketbase";
import { A } from "@solidjs/router";
import LikeButton from "../components/LikeButton.jsx";

export default function Home() {
  const auth = useAuth();
  const [loading, setLoading] = createSignal(true);
  const [posts, setPosts] = createSignal([]);
  const [error, setError] = createSignal(null);

  onMount(loadPosts);

  async function loadPosts() {
    setLoading(true);
    setError(null);
    try {
      const result = await pb.collection("posts").getFullList({
        sort: "-created",
        expand: "author,category"
      });
      setPosts(result);
    } catch (err) {
      setError("Greška pri dohvaćanju postova.");
    } finally {
      setLoading(false);
    }
  }

  const GuestView = () => (
    <div class="bg-gradient-to-br from-cyan-100 to-blue-200 rounded-lg p-8 shadow-md mb-8">
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

  return (
    <div class="max-w-5xl mx-auto p-4">
      <Show when={!auth()}>
        <GuestView />
      </Show>

      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-cyan-700">Najnoviji blogovi</h1>
        <Show when={auth()}>
          <A
            href="/create"
            class="px-4 py-2 bg-cyan-600 text-white rounded-md shadow hover:bg-cyan-700 transition flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Novi post
          </A>
        </Show>
      </div>

      <Show when={loading()}>
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-600"></div>
          <span class="ml-3 text-gray-600">Učitavanje postova...</span>
        </div>
      </Show>

      <Show when={error()}>
        <div class="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error()}
        </div>
      </Show>

      <Show when={posts().length === 0 && !loading()}>
        <div class="text-center py-10 bg-gray-50 rounded-lg">
          <p class="text-xl text-gray-600">Još nema objavljenih postova.</p>
          <Show when={auth()}>
            <A href="/create" class="mt-4 inline-block text-cyan-600 hover:underline">
              Napiši prvi post
            </A>
          </Show>
        </div>
      </Show>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <For each={posts()}>
          {(post) => (
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <Show when={post.image}>
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}/api/files/${post.collectionId}/${post.id}/${post.image}`}
                  alt={post.title}
                  class="w-full h-48 object-cover"
                />
              </Show>
              <div class="p-4">
                <div class="flex justify-between items-center mb-2">
                  <Show when={post.expand?.category}>
                    <span class="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded">
                      {post.expand.category.name}
                    </span>
                  </Show>
                  <span class="text-xs text-gray-500">
                    {new Date(post.created).toLocaleDateString()}
                  </span>
                </div>
                <h2 class="text-xl font-bold mb-2">{post.title}</h2>
                <p class="text-gray-600 line-clamp-3">{post.content}</p>
                <div class="mt-4 flex justify-between items-center">
                  <span class="text-sm text-gray-600">
                    Autor: {post.expand?.author?.name || post.expand?.author?.email || "Nepoznato"}
                  </span>
                  <div class="flex gap-2 items-center">
                    <LikeButton postId={post.id} />
                    <Show when={auth() && auth().id === post.author}>
                      <A href={`/edit/${post.id}`} class="text-amber-600 hover:underline">Uredi</A>
                    </Show>
                  </div>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
