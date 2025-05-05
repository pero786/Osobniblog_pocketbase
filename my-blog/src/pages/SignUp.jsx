import { createSignal, Show } from "solid-js";
import { pb } from "../services/pocketbase";
import AlertMessage from "../components/AlertMessage";
import { useNavigate, A } from "@solidjs/router";

export default function SignUp() {
  const [error, setError] = createSignal(false);
  const [success, setSuccess] = createSignal(false);
  const navigate = useNavigate();

  async function formSubmit(event) {
    event.preventDefault();
    setError(false);
    setSuccess(false);

    const formData = new FormData(event.target);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const passwordConfirm = formData.get("passwordConfirm");

    if (password !== passwordConfirm) {
      setError(true);
      return;
    }

    try {
      await pb.collection("users").create({
        name, email, password, passwordConfirm
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (error) {
      console.log("Error", error);
      setError(true);
    }
  }

  return (
    <div class="max-w-md mx-auto p-4">
      <div class="text-3xl font-bold text-cyan-700 mb-6">Registracija korisnika</div>

      <Show when={!success()}>
        <form onSubmit={formSubmit} class="w-full">
          <div class="p-2 flex flex-col gap-1">
            <label>Ime</label>
            <input class="border rounded p-2" type="text" name="name" required="true" />
          </div>

          <div class="p-2 flex flex-col gap-1">
            <label>E-mail</label>
            <input class="border rounded p-2" type="email" name="email" required="true" />
          </div>

          <div class="p-2 flex flex-col gap-1">
            <label>Lozinka</label>
            <input class="border rounded p-2" type="password" name="password" required="true" minlength="8" />
          </div>

          <div class="p-2 flex flex-col gap-1">
            <label>Potvrda lozinke</label>
            <input class="border rounded p-2" type="password" name="passwordConfirm" required="true" minlength="8" />
          </div>

          <div class="p-2 flex flex-col gap-1">
            <input type="submit" value="Registriraj se" class="bg-cyan-600 text-white p-2 rounded cursor-pointer hover:bg-cyan-700" />
          </div>
        </form>

        <div class="mt-4 text-center">
          <p>Već imate račun? <A href="/signin" class="text-cyan-600 hover:underline">Prijavi se</A></p>
        </div>
      </Show>

      <Show when={success()}>
        <AlertMessage message="Uspješno ste se registrirali. Preusmjeravanje na prijavu..." />
      </Show>

      <Show when={error()}>
        <AlertMessage type="error" message="Dogodila se greška prilikom stvaranja korisničkog računa, provjerite svoje podatke." />
      </Show>
    </div>
  );
}
