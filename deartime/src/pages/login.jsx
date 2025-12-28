import React, { useEffect } from "react";
import backgroundImg from "../assets/background.svg";
import logoImg from "../assets/logo.svg";
import "../styles/landing.css";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  // 이미 로그인된 유저면 홈으로
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.post(
          "http://localhost:8080/auth/google",
          {
            accessToken: tokenResponse.access_token,
          }
        );

        const { isNewUser, accessToken } = res.data;

        localStorage.setItem("accessToken", accessToken);

        if (isNewUser) {
          navigate("/signup");
        } else {
          navigate("/home");
        }
      } catch (err) {
        console.error("Google 로그인 실패", err);
      }
    },
    onError: () => {
      console.log("Google Login Failed");
    },
  });

  return (
    <div className="landing-container">
      <img src={backgroundImg} alt="landing" className="background-img" />
      <img src={logoImg} alt="logo" className="logo-img" />

      <p className="landing-text">
        별빛처럼 사라지지 않는 기억을 기록하는 곳
      </p>

      <button className="google-login-btn" onClick={googleLogin}>
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
