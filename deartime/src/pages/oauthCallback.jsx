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
    const error = params.get("error");

    if (error) {
      navigate("/", { replace: true });
      return;
    }

    if (tempToken) {
      localStorage.setItem("tempToken", tempToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate("/signup", { replace: true });
      return;
    }

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);

      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      else localStorage.removeItem("refreshToken");

      window.history.replaceState({}, document.title, window.location.pathname);
      navigate("/home", { replace: true });
      return;
    }

    // 토큰이 없으면 루트로
    navigate("/", { replace: true });
  }, [navigate]);

  return <div>로그인 처리 중...</div>;
};

export default OAuthCallback;
