import { onMount } from "solid-js";
import { pb } from "../services/pocketbase";
import { useNavigate } from "@solidjs/router";
import AlertMessage from "../components/AlertMessage";

export default function SignOut() {
    const navigate = useNavigate();

    onMount(async () => {
        pb.authStore.clear();
        
        setTimeout(() => {
            navigate("/");
        }, 1500);
    });

    return (
        <div class="max-w-md mx-auto p-8 text-center">
            <AlertMessage message="Uspješno ste se odjavili." />
        </div>
    );
}
