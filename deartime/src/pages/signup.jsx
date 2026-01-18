import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import backgroundImg from "../assets/background.svg";
import logoImg from "../assets/logo.svg";

const Signup = () => {
  const navigate = useNavigate();

  // 이메일은 로컬스토리지에서 가져옴 (보여주기용)
  const email = localStorage.getItem("userEmail") || "";

  const [form, setForm] = useState({
    nickname: "",
    birthDate: "", 
    bio: "",       
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // 1. 닉네임 유효성 검사 (공백 체크)
    if (!form.nickname.trim()) {
      alert("닉네임은 필수입니다.");
      return;
    }

    const tempToken = localStorage.getItem("tempToken");

    // [디버깅] 토큰 확인
    if (!tempToken || tempToken === "undefined" || tempToken === "null") {
      alert("로그인이 필요합니다. (토큰 없음)");
      navigate("/login");
      return;
    }

    try {
      // 2. [핵심 수정] 모든 필드를 포함하되, 값이 없으면 null로 보냄
      // 백엔드가 필드 누락 시 500 에러를 뱉는 것을 방지
      const requestBody = {
        nickname: form.nickname,
        // 빈 문자열("")이면 null로 변환해서 전송
        birthDate: form.birthDate ? form.birthDate : null, 
        bio: form.bio ? form.bio : null,
        // 프로필 이미지는 현재 업로드 기능이 없으므로 명시적 null 전송
        profileImageUrl: null 
      };

      console.log("🚀 [요청 시작] URL: /api/users/signup");
      console.log("📦 [요청 바디]:", requestBody);
      console.log("🔑 [Authorization 헤더]:", `Bearer ${tempToken}`);

      const response = await axios.post(
        "/api/users/signup",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // 3. 성공 처리
      console.log("✅ [요청 성공] 응답:", response);

      const accessToken =
        response.headers["authorization"]?.replace("Bearer ", "") ||
        response.data.data.accessToken;

      const refreshToken =
        response.headers["refresh-token"] ||
        response.data.data.refreshToken;

      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      // 임시 토큰 제거
      localStorage.removeItem("tempToken");

      alert("회원가입이 완료되었습니다!");
      navigate("/home");

    } catch (error) {
      // 4. 에러 처리
      console.error("❌ [에러 발생]:", error);

      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        console.log(`🔥 [서버 응답 ${status}] 데이터:`, errorData);

        // 에러 메시지 표시 로직
        let errorMessage = "알 수 없는 에러";
        if (errorData && typeof errorData === "object") {
             errorMessage = JSON.stringify(errorData, null, 2);
        } else if (errorData) {
             errorMessage = errorData;
        }

        // 500 에러인데 메시지가 없는 경우
        if (status === 500 && !errorData) {
            errorMessage = "서버 내부 오류입니다. (데이터 형식이 맞지 않을 가능성이 높음)";
        }

        alert(`[오류 ${status}]\n${errorMessage}`);

        if (status === 409) {
           navigate("/login");
        }
      } else if (error.request) {
        alert("서버로부터 응답이 없습니다.");
      } else {
        alert(`요청 중 오류 발생: ${error.message}`);
      }
    }
  };

  return (
    <div className="signup-container">
      <img src={backgroundImg} alt="background" className="background-img" />

      <div className="signup-card">
        <img src={logoImg} alt="DearTime" className="signup-logo-img" />

        {/* 프로필 이미지는 제외 (서버 에러 방지) */}
        
        <div className="form-section">
          <div className="input-group">
            <label>아이디</label>
            <input
              type="text"
              value={email}
              disabled
              className="disabled-input"
            />
          </div>

          <div className="input-group">
            <label>닉네임</label>
            <input
              name="nickname"
              placeholder="닉네임을 입력하세요"
              value={form.nickname}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>생년월일</label>
            <input
              type="date"
              name="birthDate"
              value={form.birthDate}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>자기소개</label>
            <textarea
              name="bio"
              placeholder="자기소개를 입력하세요"
              value={form.bio}
              onChange={handleChange}
            />
          </div>
        </div>

        <button className="signup-button" onClick={handleSubmit}>
          회원가입
        </button>
      </div>
    </div>
  );
};

export default Signup;