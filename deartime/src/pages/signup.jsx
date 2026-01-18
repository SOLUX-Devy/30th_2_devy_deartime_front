import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import backgroundImg from "../assets/background.svg";
import logoImg from "../assets/logo.svg";
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

  const [profilePreview, setProfilePreview] = useState(defaultProfileImg);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setProfilePreview(previewUrl);
    // 현재는 서버로 이미지 파일 자체를 보내지 않으므로 form 업데이트는 생략하거나 추후 구현
  };

  const handleSubmit = async () => {
    // 1. 필수값 체크
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
      // 2. [핵심 수정] 값이 있는 필드만 동적으로 추가 (빈 문자열 전송 방지)
      const requestBody = {
        nickname: form.nickname,
      };

      // birthDate가 비어있지 않을 때만 추가 (빈 문자열 ""을 보내면 서버가 날짜 파싱하다 죽음)
      if (form.birthDate) {
        requestBody.birthDate = form.birthDate;
      }

      // bio가 비어있지 않을 때만 추가
      if (form.bio && form.bio.trim() !== "") {
        requestBody.bio = form.bio;
      }

      // profileImageUrl: 현재 업로드 로직이 없으므로 아예 보내지 않거나,
      // 유효한 URL 문자열일 때만 보냅니다. (빈 값 전송 금지)
      if (form.profileImageUrl && form.profileImageUrl.startsWith("http")) {
        requestBody.profileImageUrl = form.profileImageUrl;
      }

      console.log("🚀 [최종 전송 데이터]:", requestBody);

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
      const accessToken =
        response.headers["authorization"]?.replace("Bearer ", "") ||
        response.data.data?.accessToken; // data가 없을 수도 있으므로 optional chaining

      const refreshToken =
        response.headers["refresh-token"] ||
        response.data.data?.refreshToken;

      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      localStorage.removeItem("tempToken");

      alert("회원가입 성공!");
      navigate("/home");

    } catch (error) {
      console.error("❌ 에러 객체:", error);

      if (error.response) {
        // 서버가 500 에러와 함께 HTML을 뱉는 경우 JSON 파싱이 안돼서 data가 이상하게 나올 수 있음
        const errorData = error.response.data;
        const status = error.response.status;

        console.log("🔥 서버 응답 데이터:", errorData);

        if (status === 500) {
           alert("서버 내부 오류(500)가 발생했습니다.\n서버 로그를 확인해야 정확한 원인을 알 수 있습니다.");
        } else if (status === 400) {
           alert(`입력값 오류: ${JSON.stringify(errorData)}`);
        } else if (status === 409) {
           alert("이미 가입된 회원입니다.");
           navigate("/login");
        } else {
           alert(`오류 발생 (${status})`);
        }
      } else {
        alert("서버 응답이 없습니다. (네트워크 혹은 서버 다운)");
      }
    }
  };

  return (
    <div className="signup-container">
      <img src={backgroundImg} alt="background" className="background-img" />

      <div className="signup-card">
        <img src={logoImg} alt="DearTime" className="signup-logo-img" />

        <label className="profile-image-wrapper">
          <img 
            src={profilePreview} 
            alt="profile" 
            className="profile-img" 
            onError={(e) => {e.target.src = defaultProfileImg}}
          />
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleProfileImageChange}
          />
        </label>

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

        <button className="signup-button" onClick={handleSubmit}>
          회원가입
        </button>
      </div>
    </div>
  );
};

export default Signup;