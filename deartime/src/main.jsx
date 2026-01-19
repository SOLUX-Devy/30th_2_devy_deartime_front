import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import UserProvider from "./context/UserProvider";


ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
    <UserProvider>
      <App />
    </UserProvider>
  </GoogleOAuthProvider>
);