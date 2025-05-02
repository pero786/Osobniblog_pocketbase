import { createContext, createSignal, useContext, onMount } from "solid-js";
import { pb } from "../services/pocketbase";

const AuthContext = createContext();

export function AuthProvider(props) {
  const [user, setUser] = createSignal(pb.authStore.model);

  onMount(() => {
    setUser(pb.authStore.model);

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setUser(model);
    });

    return unsubscribe;
  });

  // Metode za autentifikaciju
  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      return authData;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password, passwordConfirm, name) => {
    try {
      const userData = {
        email,
        password,
        passwordConfirm,
        name
      };
      return await pb.collection('users').create(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    pb.authStore.clear();
  };

  const value = {
    user,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth se mora koristiti unutar AuthProvider-a");
  }
  return context.user;
}

