import { useNavigate } from "@solidjs/router";

export default function Error() {
  const navigate = useNavigate();

  return (
    <div class="min-h-screen flex items-center justify-center p-5 bg-gray-100">
      <div class="max-w-md p-8 bg-white shadow-lg rounded-lg text-center">
        <h1 class="text-4xl font-bold text-red-600 mb-4">Greška</h1>
        <p class="text-gray-600 mb-6">
          Stranica koju tražite ne postoji ili je došlo do greške.
        </p>
        <button
          onClick={() => navigate("/")}
          class="inline-block px-6 py-2 bg-cyan-600 text-white font-medium rounded-md hover:bg-cyan-700 transition"
        >
          Povratak na naslovnicu
        </button>
      </div>
    </div>
  );
}
