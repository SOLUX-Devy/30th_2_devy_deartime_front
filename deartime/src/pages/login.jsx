// import React, { useEffect } from "react";
import backgroundImg from "../assets/background.svg";
import logoImg from "../assets/logo.svg";
import "../styles/landing.css";
// import { useNavigate } from "react-router-dom";

const Login = () => {
  

  const handleGoogleLogin = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    // 현재 접속한 도메인 기준으로 콜백 고정 (로컬이면 로컬, 배포면 배포)
    const redirectUri = `${window.location.origin}/oauth/callback`;

    window.location.href =
      `${apiBaseUrl}/api/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  return (
    <div className="landing-container">
      <img src={backgroundImg} alt="landing" className="background-img" />
      <img src={logoImg} alt="logo" className="logo-img" />

      <p className="landing-text">별빛처럼 사라지지 않는 기억을 기록하는 곳</p>

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
