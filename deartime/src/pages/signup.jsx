import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import backgroundImg from "../assets/background.svg";
import logoImg from "../assets/logo.svg";
// 프로필 기본 이미지 import 필수 (경로 확인해주세요)
import defaultProfileImg from "../assets/profile.jpg"; 

const Signup = () => {
  const navigate = useNavigate();

  const email = localStorage.getItem("userEmail") || "";

  const [form, setForm] = useState({
    nickname: "",
    birthDate: "",
    bio: "",
    profileImageUrl: "",
  });

  // 프로필 이미지 미리보기 상태
  const [profilePreview, setProfilePreview] = useState(defaultProfileImg);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 프로필 사진 변경 핸들러 (UI 표시용)
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 화면에 보여주기 위한 미리보기 URL 생성
    const previewUrl = URL.createObjectURL(file);
    setProfilePreview(previewUrl);
    
    // 주의: 실제 서버 전송용 URL은 아직 없으므로 form에는 담지 않거나 빈 값 유지
    // 나중에 S3 업로드 로직이 추가되면 여기서 처리
  };

  const handleSubmit = async () => {
    if (!form.nickname.trim()) {
      alert("닉네임은 필수입니다.");
      return;
    }

    const tempToken = localStorage.getItem("tempToken");

    if (!tempToken || tempToken === "undefined" || tempToken === "null") {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      // [핵심 수정] 서버 죽는 것을 방지하기 위해 null 대신 ""(빈 문자열) 전송
      const requestBody = {
        nickname: form.nickname,
        // 값이 없으면 빈 문자열("")을 보냄. (백엔드가 null을 싫어할 수 있음)
        birthDate: form.birthDate ? form.birthDate : "", 
        bio: form.bio ? form.bio : "",
        // 프로필 이미지는 현재 파일 업로드 API가 없으므로 빈 문자열 전송 (에러 방지)
        profileImageUrl: "" 
      };

      console.log("🚀 [전송 Body]:", requestBody);

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

      // 성공 처리
      const accessToken =
        response.headers["authorization"]?.replace("Bearer ", "") ||
        response.data.data.accessToken;

      const refreshToken =
        response.headers["refresh-token"] ||
        response.data.data.refreshToken;

      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      localStorage.removeItem("tempToken");

      alert("회원가입이 완료되었습니다!");
      navigate("/home");

    } catch (error) {
      console.error("❌ 에러 발생:", error);

      if (error.response) {
        const { status, data } = error.response;
        // 500 에러 내용 상세 표시
        alert(`[가입 실패] 서버 에러 (${status})\n${JSON.stringify(data, null, 2)}`);
        
        if (status === 409) navigate("/login");
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

        {/* 프로필 이미지 UI 복구 */}
        <label className="profile-image-wrapper">
          <img 
            src={profilePreview} 
            alt="profile" 
            className="profile-img" 
            // 이미지가 깨질 경우 기본 이미지로 대체하는 코드 추가
            onError={(e) => {e.target.src = defaultProfileImg}}
          />
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleProfileImageChange}
          />
          {/* 카메라 아이콘이나 오버레이가 필요하면 여기에 추가 CSS */}
        </label>

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