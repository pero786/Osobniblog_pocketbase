import { createSignal, onMount, For, Show } from "solid-js";
import { useAuth } from "../components/AuthProvider";
import { pb } from "../services/pocketbase";
import { A } from "@solidjs/router";

export default function Home() {
    const user = useAuth();

    const [posts, setPosts] = createSignal([]);
    const [categories, setCategories] = createSignal([]);
    const [selectedCategory, setSelectedCategory] = createSignal(null);
    const [error, setError] = createSignal(false);
    const [loading, setLoading] = createSignal(true);

    onMount(async () => {
        await loadCategories();
        await loadPosts();
    });

    async function loadCategories() {
        try {
            const result = await pb.collection("categories").getFullList();
            setCategories(result);
        } catch (error) {
            console.log("Greška pri učitavanju kategorija:", error);
        }
    }

    async function loadPosts() {
        setError(false);
        setLoading(true);
        try {
            let filter = "";
            if (selectedCategory()) {
                filter = `category="${selectedCategory()}"`;
            }

            const result = await pb.collection("posts").getFullList({
                sort: "-created",
                filter: filter,
                expand: "author,category"
            });
            setPosts(result);
        } catch (error) {
            console.log("Greška pri učitavanju postova:", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    async function likePost(post) {
        if (!user()) return;

        try {
            // Provjeri ima li korisnik već lajk na ovom postu
            const existingLike = await pb.collection("likes").getFirstListItem(`post="${post.id}" && user="${user().id}"`).catch(() => null);

            if (existingLike) {
                // Ako lajk postoji, ukloni ga
                await pb.collection("likes").delete(existingLike.id);
            } else {
                // Ako ne postoji, dodaj novi lajk
                await pb.collection("likes").create({
                    post: post.id,
                    user: user().id
                });
            }

            // Ponovno učitaj postove da ažuriraš prikaz
            await loadPosts();
        } catch (error) {
            console.log("Greška pri lajkanju:", error);
            setError(true);
        }
    }

    function filterByCategory(categoryId) {
        setSelectedCategory(categoryId);
        loadPosts();
    }

    return (
        <div class="p-4 max-w-6xl mx-auto">
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-4xl font-bold text-cyan-700">Osobni Blog</h1>
                <Show when={user()}>
                    <A href="/create" class="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition">
                        + Novi post
                    </A>
                </Show>
            </div>

            {/* Filter kategorija */}
            <div class="mb-6">
                <h2 class="text-xl font-semibold mb-2">Kategorije:</h2>
                <div class="flex flex-wrap gap-2">
                    <button
                        onClick={() => filterByCategory(null)}
                        class={`px-3 py-1 rounded ${!selectedCategory() ? 'bg-cyan-600 text-white' : 'bg-gray-200'}`}>
                        Sve
                    </button>
                    <For each={categories()}>
                        {(category) => (
                            <button
                                onClick={() => filterByCategory(category.id)}
                                class={`px-3 py-1 rounded ${selectedCategory() === category.id ? 'bg-cyan-600 text-white' : 'bg-gray-200'}`}>
                                {category.name}
                            </button>
                        )}
                    </For>
                </div>
            </div>

            <Show when={error()}>
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    Dogodila se greška pri učitavanju postova. Molimo pokušajte ponovno.
                </div>
            </Show>

            <Show when={loading()}>
                <div class="text-center py-10">
                    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600 mx-auto"></div>
                    <p class="mt-2 text-gray-600">Učitavanje postova...</p>
                </div>
            </Show>

            <Show when={!loading() && posts().length === 0}>
                <div class="text-center py-10 bg-gray-50 rounded-lg">
                    <p class="text-xl text-gray-600">Nema dostupnih postova.</p>
                    <Show when={user()}>
                        <p class="mt-2">
                            <A href="/create" class="text-cyan-600 hover:underline">
                                Kreiraj prvi post
                            </A>
                        </p>
                    </Show>
                </div>
            </Show>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <For each={posts()}>
                    {(post) => (
                        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                            <Show when={post.image}>
                                <div class="h-48 overflow-hidden">
                                    <img
                                        src={`http://localhost:3003/api/files/${post.collectionId}/${post.id}/${post.image}`}
                                        alt={post.title}
                                        class="w-full h-full object-cover"
                                    />
                                </div>
                            </Show>
                            <div class="p-4">
                                <div class="flex items-center justify-between">
                                    <Show when={post.expand?.category}>
                                        <span class="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded">
                                            {post.expand.category.name}
                                        </span>
                                    </Show>
                                    <span class="text-xs text-gray-500">
                                        {new Date(post.created).toLocaleDateString()}
                                    </span>
                                </div>
                                <h2 class="text-xl font-bold mt-2 mb-2">{post.title}</h2>
                                <p class="text-gray-600 line-clamp-3 mb-3">
                                    {post.content}
                                </p>
                                <div class="flex items-center justify-between mt-4">
                                    <div class="flex items-center">
                                        <span class="text-sm text-gray-600">
                                            Autor: {post.expand?.author?.name || "Nepoznat"}
                                        </span>
                                    </div>
                                    <div class="flex gap-2">
                                        <A
                                            href={`/post/${post.id}`}
                                            class="text-cyan-600 hover:underline text-sm">
                                            Pročitaj više
                                        </A>
                                        <Show when={user() && user().id === post.author}>
                                            <A
                                                href={`/edit/${post.id}`}
                                                class="text-amber-600 hover:underline text-sm">
                                                Uredi
                                            </A>
                                        </Show>
                                    </div>
                                </div>
                                <Show when={user()}>
                                    <button
                                        onClick={() => likePost(post)}
                                        class="mt-3 flex items-center gap-1 text-gray-600 hover:text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        Like
                                    </button>
                                </Show>
                            </div>
                        </div>
                    )}
                </For>
            </div>
        </div>
    );
}
