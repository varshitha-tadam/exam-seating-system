import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import axios from "axios";

// Automatically bypass localtunnel and ngrok warning screens on the Vercel frontend
axios.defaults.headers.common["Bypass-Tunnel-Reminder"] = "true";
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);