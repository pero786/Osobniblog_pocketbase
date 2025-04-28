import { createContext, createSignal, useContext, onMount } from "solid-js";
import { pb } from "../services/pocketbase";

// Kreiraj kontekst za autentifikaciju
const AuthContext = createContext();

// AuthProvider komponenta koja će obavijati aplikaciju
export function AuthProvider(props) {
  const [user, setUser] = createSignal(pb.authStore.model);

  // Osluškuj promjene u autentifikaciji
  onMount(() => {
    // Postavi trenutno stanje
    setUser(pb.authStore.model);

    // Osluškuj buduće promjene
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setUser(model);
    });

    // Očisti slušatelje kad se komponenta uništi
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

  // Vrijednosti koje želimo izložiti kroz kontekst
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

// Hook za pristup kontekstu
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth se mora koristiti unutar AuthProvider-a");
  }
  return context.user;
}

