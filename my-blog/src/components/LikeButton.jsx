import { createSignal, onMount } from "solid-js";
import { pb } from "../services/pocketbase";
import { useAuth } from "../components/AuthProvider";

export default function LikeButton({ postId }) {
  const auth = useAuth();
  const [likes, setLikes] = createSignal(0);
  const [userLiked, setUserLiked] = createSignal(false);
  const [likeId, setLikeId] = createSignal(null);
  const [loading, setLoading] = createSignal(false);

  // Učitaj podatke o lajkovima pri mountanju komponente
  onMount(async () => {
    await loadLikes();
  });

  async function loadLikes() {
    setLoading(true);
    try {
      // Dohvati sve lajkove za ovaj post
      const likesList = await pb.collection("likes").getFullList({
        filter: `post="${postId}"`
      });
      setLikes(likesList.length);

      // Provjeri je li trenutni korisnik već lajkao
      if (auth()) {
        const existingLike = likesList.find(like => like.user === auth().id);
        if (existingLike) {
          setUserLiked(true);
          setLikeId(existingLike.id);
        } else {
          setUserLiked(false);
          setLikeId(null);
        }
      }
    } catch (error) {
      console.error("Greška pri dohvaćanju lajkova:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleLike() {
    if (!auth() || loading()) return;
    
    setLoading(true);
    try {
      if (userLiked()) {
        // Ako je korisnik već lajkao, ukloni lajk
        await pb.collection("likes").delete(likeId());
        setUserLiked(false);
        setLikeId(null);
        setLikes(likes() - 1);
      } else {
        // Ako korisnik nije lajkao, dodaj lajk
        const data = {
          post: postId,
          user: auth().id
        };
        const record = await pb.collection("likes").create(data);
        setUserLiked(true);
        setLikeId(record.id);
        setLikes(likes() + 1);
      }
    } catch (error) {
      console.error("Greška pri lajkanju/odlajkanju:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleLike}
      disabled={loading() || !auth()}
      class={`flex items-center gap-1 px-2 py-1 rounded ${
        userLiked() ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-600"
      } ${auth() ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed opacity-60"}`}
      title={!auth() ? "Prijavi se za lajk" : userLiked() ? "Ukloni lajk" : "Lajkaj post"}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill={userLiked() ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span>{likes()}</span>
    </button>
  );
}
