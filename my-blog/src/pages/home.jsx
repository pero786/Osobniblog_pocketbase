import { createSignal, onMount } from "solid-js";
import { useAuth } from "../components/AuthProvider";
import { pb } from "../services/pocketbase";

export default function Home() {
  const user = useAuth();
  const [posts, setPosts] = createSignal([]);

  onMount(async () => {
    try {
      const result = await pb.collection("posts").getFullList();
      setPosts(result);
    } catch (error) {
      console.error("Greška pri učitavanju:", error);
    }
  });

  return (
    <div class="p-4">
      <h1 class="text-3xl font-bold text-blue-600 mb-4">Osobni Blog</h1>
      
      {user() ? (
        <p>Prijavljen kao: {user().email}</p>
      ) : (
        <p>Niste prijavljeni</p>
      )}
      
      <div class="mt-4">
        <h2 class="text-xl font-semibold mb-2">Postovi:</h2>
        {posts().length === 0 ? (
          <p>Nema postova za prikaz</p>
        ) : (
          <ul>
            {posts().map(post => (
              <li class="mb-2 p-2 bg-gray-100 rounded">{post.title}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
