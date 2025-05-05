import { createSignal, Show, For, onMount, createEffect } from "solid-js";
import { pb } from "../services/pocketbase";
import { useAuth } from "../components/AuthProvider";
import AlertMessage from "../components/AlertMessage";
import { A, useNavigate } from "@solidjs/router";

export default function CreatePost() {
    const navigate = useNavigate();
    const user = useAuth();

    const [success, setSuccess] = createSignal(false);
    const [error, setError] = createSignal(false);
    const [categories, setCategories] = createSignal([]);
    const [selected, setSelected] = createSignal(null);
    const [imageFile, setImageFile] = createSignal(null);

    onMount(async () => {
        await loadCategories();
    });

    createEffect(() => {
        if (success() === true) {
            setTimeout(() => {
                setSuccess(false);
                navigate("/");
            }, 2000);
        }
    });

    async function loadCategories() {
        setError(false);
        try {
            const result = await pb.collection("categories").getFullList();
            setCategories(result);
        } catch (error) {
            console.log(error);
            setError(true);
        }
    }

    async function formSubmit(event) {
        event.preventDefault();

        setSuccess(false);
        setError(false);

        const formData = new FormData(event.target);
        const title = formData.get("title");
        const content = formData.get("content");
        const category = formData.get("category");
        const image = event.target.image.files[0];

        try {
            if (!title || !content) {
                setError("Naslov i sadržaj su obavezni");
                return;
            }
            const data = new FormData();
            data.append("title", title);
            data.append("content", content);
            data.append("author", user().id);
            
            if (category) {
                data.append("category", category);
            }
            
            if (image) {
                data.append("image", image);
            }

            if (selected()) {
                await pb.collection("posts").update(selected().id, data);
                setSelected(null);
            } else {
                await pb.collection("posts").create(data);
            }

            setSuccess(true);
            event.target.reset();
        } catch (error) {
            console.log(error);
            setError(true);
        }
    }

    return (
        <div class="max-w-3xl mx-auto p-4">
            <h1 class="text-3xl font-bold text-cyan-700 mb-6">
                {selected() ? "Uredi post" : "Kreiraj novi post"}
            </h1>

            <Show when={success()}>
                <AlertMessage message={selected() ? "Post uspješno ažuriran" : "Post uspješno objavljen"} />
            </Show>

            <Show when={error()}>
                <AlertMessage type="error" message={typeof error() === 'string' ? error() : "Dogodila se greška, provjerite unos."} />
            </Show>

            <form onSubmit={formSubmit} class="space-y-6 bg-white rounded-lg p-6 shadow-sm">
                <div class="space-y-2">
                    <label class="block text-gray-700 font-medium">Naslov</label>
                    <input 
                        class="w-full border rounded p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" 
                        type="text" 
                        name="title" 
                        required 
                        minLength="2" 
                        maxLength="70" 
                        value={selected() ? selected().title : ""}
                    />
                </div>

                <div class="space-y-2">
                    <label class="block text-gray-700 font-medium">Kategorija</label>
                    <select 
                        class="w-full border rounded p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" 
                        name="category"
                        value={selected() ? selected().category : ""}
                    >
                        <option value="">Odaberi kategoriju</option>
                        <For each={categories()}>
                            {(category) => (
                                <option value={category.id}>{category.name}</option>
                            )}
                        </For>
                    </select>
                </div>

                <div class="space-y-2">
                    <label class="block text-gray-700 font-medium">Sadržaj</label>
                    <textarea 
                        class="w-full border rounded p-2 h-48 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" 
                        name="content" 
                        required 
                        minLength="10"
                        value={selected() ? selected().content : ""}
                    ></textarea>
                </div>

                <div class="space-y-2">
                    <label class="block text-gray-700 font-medium">Slika</label>
                    <input 
                        class="w-full border rounded p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" 
                        type="file" 
                        name="image" 
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                    />
                    <Show when={selected() && selected().image}>
                        <div class="mt-2">
                            <p class="text-sm text-gray-500">Trenutna slika: {selected().image}</p>
                        </div>
                    </Show>
                </div>

                <div class="flex justify-end gap-2 pt-4">
                    <button 
                        type="button" 
                        onClick={() => navigate("/")} 
                        class="px-4 py-2 border rounded hover:bg-gray-100 transition"
                    >
                        Odustani
                    </button>
                    <button 
                        type="submit" 
                        class="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition"
                    >
                        {selected() ? "Spremi promjene" : "Objavi post"}
                    </button>
                </div>
            </form>
        </div>
    );
}
