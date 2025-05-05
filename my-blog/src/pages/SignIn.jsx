import { createSignal, Show } from "solid-js";
import { pb } from "../services/pocketbase";
import { useNavigate, A } from "@solidjs/router";
import AlertMessage from "../components/AlertMessage";

export default function SignIn() {
    const navigate = useNavigate();
    const [error, setError] = createSignal(false);

    async function formSubmit(event) {
        event.preventDefault();
        setError(false);
        
        const formData = new FormData(event.target);
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            await pb.collection("users").authWithPassword(email, password);
            navigate("/");
        } catch (error) {
            console.log("Error", error);
            setError(true);
        }
    }

    return (
        <div class="max-w-md mx-auto p-4">
            <div class="text-3xl font-bold text-cyan-700 mb-6">Prijava korisnika</div>
            
            <form onSubmit={formSubmit} class="w-full">
                <div class="p-2 flex flex-col gap-1">
                    <label>E-mail</label>
                    <input class="border rounded p-2" type="email" name="email" required="true" />
                </div>

                <div class="p-2 flex flex-col gap-1">
                    <label>Lozinka</label>
                    <input class="border rounded p-2" type="password" name="password" required="true" />
                </div>

                <div class="p-2 flex flex-col gap-1">
                    <input type="submit" value="Prijavi se" class="bg-cyan-600 text-white p-2 rounded cursor-pointer hover:bg-cyan-700" />
                </div>
            </form>
            
            <div class="mt-4 text-center">
                <p>Nemate račun? <A href="/signup" class="text-cyan-600 hover:underline">Registriraj se</A></p>
            </div>
            
            <Show when={error()}>
                <AlertMessage type="error" message="Dogodila se greška prilikom prijave, provjerite svoju e-mail adresu i/ili lozinku." />
            </Show>
        </div>
    );
}
