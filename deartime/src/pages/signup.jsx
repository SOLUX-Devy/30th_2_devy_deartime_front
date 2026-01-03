import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import backgroundImg from "../assets/background.svg";
import logoImg from "../assets/logo.svg";
import profileImg from "../assets/profile.jpg";

const Signup = () => {
  const navigate = useNavigate();

  // 구글 로그인에서 가져온 이메일 (예시)
  const [email] = useState("devi@sookmyung.ac.kr");

  const [form, setForm] = useState({
    nickname: "",
    birthDate: "",
    bio: "",
    profileImageUrl: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    if (!form.nickname.trim()) {
      alert("닉네임은 필수입니다.");
      return;
    }

    try {
      const tempToken = localStorage.getItem("temp_token");

      const requestBody = {
        nickname: form.nickname,
        ...(form.birthDate && { birthDate: form.birthDate }),
        ...(form.bio && { bio: form.bio }),
        ...(form.profileImageUrl && { profileImageUrl: form.profileImageUrl }),
      };

      const response = await axios.post(
        "http://localhost:8080/users/signup",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const accessToken = response.headers["authorization"]?.replace("Bearer ", "") || response.data.data.accessToken;
      const refreshToken = response.headers["refresh-token"] || response.data.data.refreshToken;

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.removeItem("temp_token");

      navigate("/home");
    } catch (error) {
      console.error("회원가입 실패", error);
      alert("회원가입에 실패했습니다.");
    }
  };

  return (
    <div className="signup-container">
      <img src={backgroundImg} alt="background" className="background-img" />
      
      <div className="signup-card">
        <img src={logoImg} alt="DearTime" className="signup-logo-img" />
        <img src={profileImg} alt="profile" className="profile-img" />

        {/* 입력 폼 섹션 */}
        <div className="form-section">
          <div className="input-group">
            <label>아이디</label>
            <input type="text" value={email} disabled className="disabled-input" />
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

        <button className="signup-button" onClick={handleSubmit}>회원가입</button>
      </div>
    </div>
  );
};

export default Signup;