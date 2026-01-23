import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import backgroundImg from "../assets/background.svg";
import logoImg from "../assets/logo.svg";
import defaultProfileImg from "../assets/nophoto.png";
import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect } from "react";

const Signup = () => {
  const navigate = useNavigate();
  // ✅ 팀 규칙: env base url 사용
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // ✅ 회원가입 플로우에서는 tempToken 우선 (없으면 accessToken)
  const token =
    localStorage.getItem("tempToken") || localStorage.getItem("accessToken");

  let email = "";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      email = decoded.email || "";
    } catch (e) {
      console.error("토큰 디코딩 실패", e);
    }
  }

  useEffect(() => {
    const tempToken = localStorage.getItem("tempToken");
    const accessToken = localStorage.getItem("accessToken");

    // 회원가입 플로우는 tempToken이 기본 전제.
    // 이미 가입이 끝난 상태라 accessToken만 있다면 홈으로 보내도 됨.
    if (!tempToken) {
      if (accessToken) navigate("/home", { replace: true });
      else navigate("/", { replace: true });
    }
  }, [navigate]);

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

  const isSignupDisabled =
    !form.nickname.trim() ||
    !form.birthDate ||
    !form.bio.trim() ||
    !nicknameChecked ||
    isNicknameAvailable !== true;

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

  // ✅ 닉네임 중복 확인 (baseURL + 인증 포함 + 명세 파싱)
  const handleCheckNickname = async () => {
    const nickname = form.nickname.trim();
    if (!nickname) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    // ✅ 중복확인도 인증이 필요하다고 했으니 tempToken 우선으로 넣음
    const authToken =
      localStorage.getItem("tempToken") || localStorage.getItem("accessToken");

    if (!authToken) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        `${apiBaseUrl}/api/users/check-nickname`,
        {
          params: { nickname },
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      // ✅ 명세 응답: { status, success, message, data: { nickname, isAvailable } }
      const { success, message, data } = response.data || {};
      const isAvailable = data?.isAvailable;

      if (!success || typeof isAvailable !== "boolean") {
        alert(message || "닉네임 확인 응답이 올바르지 않습니다.");
        setNicknameChecked(false);
        setIsNicknameAvailable(null);
        return;
      }

      setNicknameChecked(true);
      setIsNicknameAvailable(isAvailable);

      alert(
        message ||
          (isAvailable
            ? "사용 가능한 닉네임입니다."
            : "이미 사용 중인 닉네임입니다."),
      );
    } catch (error) {
      console.error("닉네임 중복 확인 실패", error);

      const serverMsg = error.response?.data?.message;

      if (error.response?.status === 401) {
        alert(serverMsg || "인증이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/login");
        return;
      }

      alert(serverMsg || "닉네임 확인 중 오류가 발생했습니다.");
      setNicknameChecked(false);
      setIsNicknameAvailable(null);
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

    // ✅ 회원가입은 tempToken 필요
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
        }),
      );

      if (profileFile) {
        formData.append("profileImage", profileFile);
      }

      // ✅ 회원가입도 baseURL 적용
      const response = await axios.post(
        `${apiBaseUrl}/api/users/signup`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
            // ❗ FormData에서는 Content-Type 직접 넣지 말기
          },
        },
      );

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
            <input
              type="text"
              value={email}
              disabled
              className="disabled-input"
            />
          </div>

          <div className="input-group">
            <label>닉네임</label>
            <div className="nickname-row">
              <input
                name="nickname"
                placeholder="닉네임을 입력해주세요"
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

        <button
          className={`signup-button ${isSignupDisabled ? "disabled" : ""}`}
          onClick={handleSubmit}
          disabled={isSignupDisabled}
        >
          회원가입
        </button>
      </div>
    </div>
  );
};

export default Signup;
