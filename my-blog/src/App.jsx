import { Router, Route } from "@solidjs/router";
import Home from "../pages/home.jsx";

export default function App() {
  return (
    <Router>
      <Route path="home" component={Home} />
      
    </Router>
  );
}
