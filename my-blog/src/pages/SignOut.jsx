// src/pages/SignOut.jsx
import { onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "../components/AuthProvider";

export default function SignOut() {
  const auth = useAuth();
  const navigate = useNavigate();

  onMount(() => {
    auth.logout();
    navigate("/");
  });

  return (
    <div class="flex justify-center items-center p-8">
      <p class="text-gray-600">Odjavljujemo vas...</p>
    </div>
  );
}
