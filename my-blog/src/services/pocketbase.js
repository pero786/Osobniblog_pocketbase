import PocketBase from "pocketbase";

export const pb = new PocketBase(import.meta.env.VITE_BACKEND_URL || "http://localhost:3003");
