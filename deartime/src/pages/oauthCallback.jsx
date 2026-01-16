// /oauth/callback
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const tempToken = params.get("tempToken");
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (tempToken) {
      localStorage.setItem("tempToken", tempToken);
      navigate("/signup");
      return;
    }

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      navigate("/home");
    }
  }, [navigate]);

  return <div>로그인 처리 중...</div>;
};

export default OAuthCallback;
