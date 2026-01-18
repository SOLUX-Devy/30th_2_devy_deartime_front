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

    // [디버깅] 토큰 상태 정밀 확인
    console.log("🔍 현재 저장된 토큰:", tempToken);

    if (!tempToken || tempToken === "undefined" || tempToken === "null") {
      alert(`유효하지 않은 토큰입니다. (값: ${tempToken})\n다시 로그인해주세요.`);
      navigate("/login");
      return;
    }

    try {
      // 2. 요청 데이터 구성
      const requestBody = {
        nickname: form.nickname,
      };

      // [디버깅] 서버로 보내는 데이터와 헤더를 콘솔에 출력
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

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // 임시 토큰 제거
      localStorage.removeItem("tempToken");

      alert("회원가입이 완료되었습니다!");
      navigate("/home");

    } catch (error) {
      // 4. 에러 처리 (상세 디버깅)
      console.error("❌ [에러 발생]:", error);

      if (error.response) {
        // 서버가 응답을 줬으나 에러 코드인 경우 (500, 400, 409 등)
        const status = error.response.status;
        const errorData = error.response.data;

        console.log(`🔥 [서버 응답 ${status}] 데이터:`, errorData);

        // 에러 데이터를 문자열로 변환하여 Alert에 표시
        let errorMessage = "알 수 없는 에러";
        if (typeof errorData === "object") {
             errorMessage = JSON.stringify(errorData, null, 2);
        } else {
             errorMessage = errorData;
        }

        alert(`[서버 에러 ${status}]\n내용: ${errorMessage}`);

        if (status === 409) {
           navigate("/login");
        }
      } else if (error.request) {
        // 요청은 보냈으나 응답이 없는 경우
        alert("서버로부터 응답이 없습니다. 백엔드 서버가 켜져 있는지 확인해주세요.");
      } else {
        // 요청 설정 중 에러
        alert(`요청 설정 오류: ${error.message}`);
      }
    }
  };

  return (
    <div className="signup-container">
      <img src={backgroundImg} alt="background" className="background-img" />

      <div className="signup-card">
        <img src={logoImg} alt="DearTime" className="signup-logo-img" />

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

          {/* 주석 처리를 JSX 문법에 맞게 수정했습니다 */}
          {/* <div className="input-group">
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
          */}
        </div>

        <button className="signup-button" onClick={handleSubmit}>
          회원가입
        </button>
      </div>
    </div>
  );
};

export default Signup;