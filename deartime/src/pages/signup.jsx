import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import backgroundImg from "../assets/background.svg";
import logoImg from "../assets/logo.svg";
import defaultProfileImg from "../assets/nophoto.png";

const Signup = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail") || "";

  const [form, setForm] = useState({
    nickname: "",
    birthDate: "",
    bio: "",
  });

  const [profilePreview, setProfilePreview] = useState(defaultProfileImg);
  const [profileFile, setProfileFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 선택할 수 있습니다.");
      return;
    }

    if (profilePreview !== defaultProfileImg) {
      URL.revokeObjectURL(profilePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setProfilePreview(previewUrl);
    setProfileFile(file);
  };

  const handleSubmit = async () => {
    if (!form.nickname.trim()) {
      alert("닉네임은 필수입니다.");
      return;
    }

    const tempToken = localStorage.getItem("tempToken");
    if (!tempToken) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      const formData = new FormData();

      const signupData = {
        nickname: form.nickname,
        birthDate: form.birthDate || null,
        bio: form.bio || null,
      };

      formData.append(
        "request",
        new Blob([JSON.stringify(signupData)], {
          type: "application/json",
        })
      );

      if (profileFile) {
        formData.append("profileImage", profileFile);
      }

      const response = await axios.post(
        "/api/users/signup",
        formData,
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
          },
        }
      );

      console.log("[Signup Response]", response.data);

      const { accessToken, refreshToken } = response.data.data;

      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      localStorage.removeItem("tempToken");
      localStorage.setItem("joinDate", new Date().toISOString());

      alert("회원가입 성공!");
      navigate("/home");
    } catch (error) {
      console.error("회원가입 에러", error);
      if (error.response) {
        alert(JSON.stringify(error.response.data, null, 2));
      } else {
        alert("네트워크 오류");
      }
    }
  };


  return (
    <div className="signup-container">
      <img src={backgroundImg} alt="background" className="background-img" />

      <div className="signup-card">
        <img src={logoImg} alt="DearTime" className="signup-logo-img" />

        <div className="profile-edit-section">
          <label htmlFor="profileInput">
            <img
              src={profilePreview}
              alt="profile"
              className="profile-img clickable"
              onError={(e) => {
                e.target.src = defaultProfileImg;
              }}
            />
          </label>

          <input
            id="profileInput"
            type="file"
            accept="image/*"
            hidden
            onChange={handleProfileImageChange}
          />
        </div>

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
              placeholder="닉네임"
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
              placeholder="자기소개"
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
