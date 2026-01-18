import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import backgroundImg from "../assets/background.svg";
import logoImg from "../assets/logo.svg";
import defaultProfileImg from "../assets/profile.jpg";

const Signup = () => {
  const navigate = useNavigate();

  // ✅ 구글 로그인에서 저장된 이메일 불러오기
  const email = localStorage.getItem("user_email") || "";

  const [form, setForm] = useState({
    nickname: "",
    birthDate: "",
    bio: "",
    profileImageUrl: "",
  });

  // ✅ 프로필 이미지 미리보기용
  const [profilePreview, setProfilePreview] = useState(defaultProfileImg);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 프로필 이미지 선택
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 미리보기
    const previewUrl = URL.createObjectURL(file);
    setProfilePreview(previewUrl);

    /**
     * 지금은 서버에 업로드하지 않으므로
     * profileImageUrl은 추후 S3 연동 시 교체
     */
    setForm((prev) => ({
      ...prev,
      profileImageUrl: previewUrl,
    }));
  };

  const handleSubmit = async () => {
    if (!form.nickname.trim()) {
      alert("닉네임은 필수입니다.");
      return;
    }

    const tempToken = localStorage.getItem("temp_token");
    if (!tempToken) {
      alert("구글 로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      const requestBody = {
        nickname: form.nickname,
        ...(form.birthDate && { birthDate: form.birthDate }),
        ...(form.bio && { bio: form.bio }),
        ...(form.profileImageUrl && {
          profileImageUrl: form.profileImageUrl,
        }),
      };

      const response = await axios.post(
        "http://localhost:8080/api/users/signup",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ 토큰 헤더 / 바디 둘 다 대응
      const accessToken =
        response.headers["authorization"]?.replace("Bearer ", "") ||
        response.data.data.accessToken;

      const refreshToken =
        response.headers["refresh-token"] ||
        response.data.data.refreshToken;

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.removeItem("temp_token");

      navigate("/home");
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) alert(data.message);
        else if (status === 409) {
          alert("이미 회원가입이 완료된 사용자입니다.");
          navigate("/login");
        } else {
          alert("회원가입 중 오류가 발생했습니다.");
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

        {/* ✅ 프로필 이미지 선택 */}
        <label className="profile-image-wrapper">
          <img
            src={profilePreview}
            alt="profile"
            className="profile-img"
          />
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleProfileImageChange}
          />
        </label>

        <div className="form-section">
          {/* 이메일 (아이디) */}
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