import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import backgroundImg from "../assets/background.svg";
import logoImg from "../assets/logo.svg";
import defaultProfileImg from "../assets/nophoto.png";
import { jwtDecode } from "jwt-decode";

const Signup = () => {
  const navigate = useNavigate();

  const token =
    localStorage.getItem("tempToken") ||
    localStorage.getItem("accessToken");

  let email = "";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      email = decoded.email || "";
    } catch (e) {
      console.error("토큰 디코딩 실패", e);
    }
  }

  const [form, setForm] = useState({
    nickname: "",
    birthDate: "",
    bio: "",
  });

  const [profilePreview, setProfilePreview] = useState(defaultProfileImg);
  const [profileFile, setProfileFile] = useState(null);

  // 닉네임 중복 확인 상태
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // 닉네임 바뀌면 중복 확인 다시 필요
    if (name === "nickname") {
      setNicknameChecked(false);
      setIsNicknameAvailable(null);
    }
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

  // 🔹 닉네임 중복 확인 API
  const handleCheckNickname = async () => {
    if (!form.nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    try {
      const response = await axios.get("/api/users/check-nickname", {
        params: { nickname: form.nickname },
      });

      const { isAvailable } = response.data.data;

      setNicknameChecked(true);
      setIsNicknameAvailable(isAvailable);

      if (isAvailable) {
        alert("사용 가능한 닉네임입니다.");
      } else {
        alert("이미 사용 중인 닉네임입니다.");
      }
    } catch (error) {
      console.error("닉네임 중복 확인 실패", error);
      alert("닉네임 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async () => {
    if (!form.nickname.trim()) {
      alert("닉네임은 필수입니다.");
      return;
    }

    if (!nicknameChecked) {
      alert("닉네임 중복 확인을 해주세요.");
      return;
    }

    if (!isNicknameAvailable) {
      alert("사용할 수 없는 닉네임입니다.");
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

      const response = await axios.post("/api/users/signup", formData, {
        headers: {
          Authorization: `Bearer ${tempToken}`,
        },
      });

      const { accessToken, refreshToken } = response.data.data;

      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      localStorage.removeItem("tempToken");
      localStorage.setItem("joinDate", new Date().toISOString());

      alert("회원가입 성공!");
      navigate("/home");
    } catch (error) {
      console.error("회원가입 에러", error);
      alert("회원가입 중 오류가 발생했습니다.");
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
            <input type="text" value={email} disabled className="disabled-input" />
          </div>

          <div className="input-group">
            <label>닉네임</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                name="nickname"
                placeholder="닉네임"
                value={form.nickname}
                onChange={handleChange}
              />
              <button type="button" onClick={handleCheckNickname}>
                중복확인
              </button>
            </div>
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
