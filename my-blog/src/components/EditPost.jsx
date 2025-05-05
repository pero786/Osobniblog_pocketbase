import { createSignal, createEffect, Show, For, onMount } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { pb } from "../services/pocketbase";
import AlertMessage from "./AlertMessage";

export default function EditPost() {
  const params = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = createSignal("");
  const [content, setContent] = createSignal("");
  const [category, setCategory] = createSignal("");
  const [categories, setCategories] = createSignal([]);
  const [image, setImage] = createSignal(null);
  const [currentImage, setCurrentImage] = createSignal("");
  const [error, setError] = createSignal(false);
  const [loading, setLoading] = createSignal(true);
  const [success, setSuccess] = createSignal(false);

  onMount(async () => {
    try {
      const categoriesResult = await pb.collection("categories").getFullList();
      setCategories(categoriesResult);
      
      const post = await pb.collection("posts").getOne(params.id, {
        expand: "category"
      });
      
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category || "");
      
      if (post.image) {
        setCurrentImage(`${import.meta.env.VITE_BACKEND_URL}/api/files/${post.collectionId}/${post.id}/${post.image}`);
      }
    } catch (error) {
      console.error("Greška pri učitavanju:", error);
      setError("Nije moguće učitati post. Provjerite vezu ili pokušajte kasnije.");
    } finally {
      setLoading(false);
    }
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setError(false);
    setSuccess(false);
    
    try {
      if (!title() || !content()) {
        setError("Naslov i sadržaj su obavezni!");
        return;
      }
      
      const formData = new FormData();
      formData.append("title", title());
      formData.append("content", content());
      
      if (category()) {
        formData.append("category", category());
      }
      
      if (image()) {
        formData.append("image", image());
      }

      await pb.collection("posts").update(params.id, formData);
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Greška pri ažuriranju posta:", error);
      setError("Došlo je do greške pri spremanju posta. Molimo pokušajte ponovno.");
    }
  }

  return (
    <div class="max-w-3xl mx-auto p-4">
      <h1 class="text-3xl font-bold text-cyan-700 mb-6">Uredi post</h1>
      
      <Show when={loading()}>
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-600"></div>
          <span class="ml-3 text-gray-600">Učitavanje posta...</span>
        </div>
      </Show>
      
      <Show when={error()}>
        <AlertMessage type="error" message={error()} />
      </Show>
      
      <Show when={success()}>
        <AlertMessage message="Post je uspješno ažuriran!" />
      </Show>
      
      <Show when={!loading()}>
        <form onSubmit={handleSubmit} class="space-y-6 bg-white rounded-lg p-6 shadow-sm">
          <div class="space-y-2">
            <label class="block text-gray-700 font-medium">Naslov</label>
            <input 
              class="w-full border rounded p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" 
              type="text" 
              value={title()}
              onInput={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div class="space-y-2">
            <label class="block text-gray-700 font-medium">Kategorija</label>
            <select 
              class="w-full border rounded p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" 
              value={category()}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Odaberi kategoriju</option>
              <For each={categories()}>
                {(cat) => (
                  <option value={cat.id}>{cat.name}</option>
                )}
              </For>
            </select>
          </div>
          
          <div class="space-y-2">
            <label class="block text-gray-700 font-medium">Sadržaj</label>
            <textarea 
              class="w-full border rounded p-2 h-48 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" 
              value={content()}
              onInput={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>
          
          <div class="space-y-2">
            <label class="block text-gray-700 font-medium">Slika</label>
            <Show when={currentImage()}>
              <div class="mb-2">
                <p class="text-sm text-gray-500 mb-2">Trenutna slika:</p>
                <img src={currentImage()} alt="Trenutna slika" class="max-h-48 rounded" />
              </div>
            </Show>
            <input 
              class="w-full border rounded p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" 
              type="file" 
              onChange={(e) => setImage(e.target.files[0])}
              accept="image/*"
            />
            <p class="text-sm text-gray-500">Ostavite prazno ako ne želite mijenjati sliku.</p>
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
              Spremi promjene
            </button>
          </div>
        </form>
      </Show>
    </div>
  );
}
