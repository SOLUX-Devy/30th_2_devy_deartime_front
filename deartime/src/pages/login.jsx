import React, { useEffect } from "react";
import backgroundImg from "../assets/background.svg";
import logoImg from "../assets/logo.svg";
import "../styles/landing.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const handleGoogleLogin = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const frontBaseUrl = import.meta.env.VITE_FRONT_BASE_URL;

    const redirectUri = `${frontBaseUrl}/oauth/callback`;

    window.location.href =
      `${apiBaseUrl}/api/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
  };


  return (
    <div className="landing-container">
      <img src={backgroundImg} alt="landing" className="background-img" />
      <img src={logoImg} alt="logo" className="logo-img" />

      <p className="landing-text">
        별빛처럼 사라지지 않는 기억을 기록하는 곳
      </p>

      <button className="google-login-btn" onClick={handleGoogleLogin}>
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="google"
        />
        Google 계정으로 로그인
      </button>
    </div>
  );
};

export default Login;
