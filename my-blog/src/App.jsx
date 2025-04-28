import { Route, Router } from "@solidjs/router";
import { AuthProvider } from "./components/AuthProvider";
import Home from "./pages/home.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Route path="/" component={Home} />
      </Router>
    </AuthProvider>
  );
}
