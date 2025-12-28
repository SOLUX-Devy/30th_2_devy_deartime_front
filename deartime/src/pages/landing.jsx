import React from "react";
import landingImg from "../assets/landing.svg";
import logoImg from "../assets/logo.svg";
import "../styles/landing.css";

const Landing = () => {
    const handleGoogleLogin = () => {
        console.log("Google login clicked");
        // 구글 OAuth 연결
    };

    return (
        <div className="landing-container">
            <img src={landingImg} alt="landing" className="landing-img" />
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

export default Landing;

