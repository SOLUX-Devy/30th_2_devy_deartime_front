import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // 백으로 구글 엑세스 토큰 전달
        const res = await axios.post(
          "http://localhost:8080/auth/google",
          {
            accessToken: tokenResponse.access_token,
          }
        );

        // 백에서 받은 JWT 토큰을 로컬 스토리지에 저장
        localStorage.setItem("accessToken", res.data.accessToken);

        // 로그인 성공 시 회원가입페이지로 이동
        navigate("/signup");
      } catch (err) {
        console.error("로그인 실패", err);
      }
    },
    onError: () => {
      console.log("Google Login Failed");
    },
  });

  return (
    <div className="login-container">
      <h2>로그인</h2>

      <button className="google-login-btn" onClick={googleLogin}>
        Google 계정으로 로그인
      </button>
    </div>
  );
};

export default Login;
