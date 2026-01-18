import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import backgroundImg from "../assets/background.svg";
import logoImg from "../assets/logo.svg";
// import defaultProfileImg from "../assets/profile.jpg"; // 사용 안 함

const Signup = () => {
  const navigate = useNavigate();

  // 이메일은 로컬스토리지에서 가져옴 (보여주기용)
  const email = localStorage.getItem("userEmail") || "";

  const [form, setForm] = useState({
    nickname: "",
    // birthDate, bio, profileImageUrl은 현재 입력받지 않으므로 초기값 유지
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
    if (!tempToken) {
      alert("구글 로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      // 2. 최소 요청 데이터 구성 (닉네임만 전송)
      // API 명세의 '최소 요청 예시'에 맞춤: { "nickname": "나현" }
      const requestBody = {
        nickname: form.nickname,
      };

      console.log("전송 데이터:", requestBody); // 디버깅용 로그

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

      // 3. 응답 처리 (토큰 저장)
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
      console.error("회원가입 에러:", error); // 콘솔에 에러 상세 출력
      
      if (error.response) {
        const { status, data } = error.response;
        // 400: 닉네임 중복, 형식 오류 등
        if (status === 400) {
            alert(data.message || "입력 값을 확인해주세요.");
        }
        // 409: 이미 가입된 유저
        else if (status === 409) {
          alert("이미 회원가입이 완료된 사용자입니다.");
          navigate("/login");
        } 
        // 500 등 기타 서버 에러
        else {
          alert(`서버 오류가 발생했습니다. (Code: ${status})`);
        }
      } else {
        alert("네트워크 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="signup-container">
      <img src={backgroundImg} alt="background" className="background-img" />

      <div className="signup-card">
        <img src={logoImg} alt="DearTime" className="signup-logo-img" />

        {/* 프로필 이미지 업로드는 500 에러의 주원인이므로 주석 처리 (닉네임만 입력) */}
        {/* <label className="profile-image-wrapper">
          <img src={profilePreview} alt="profile" className="profile-img" />
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleProfileImageChange}
          />
        </label>
        */}

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

          {/* 생년월일, 자기소개는 선택사항이므로 일단 주석 처리하여 에러 방지 */}
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