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
  });

  const [profilePreview, setProfilePreview] = useState(defaultProfileImg);
  const [profileFile, setProfileFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePreview(URL.createObjectURL(file));
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

      // 1. [핵심 수정] 텍스트 데이터들을 하나의 객체로 만듭니다.
      const signupData = {
        nickname: form.nickname,
        birthDate: form.birthDate || null, // 값이 없으면 null
        bio: form.bio || null,             // 값이 없으면 null
        // profileImageUrl은 문자열로 보내는 게 아니라 아래에서 파일로 보냅니다.
      };

      // 2. [핵심 수정] JSON 객체를 Blob으로 변환하여 'request'라는 이름으로 넣습니다.
      // 백엔드 에러("Required part 'request'...")를 해결하는 결정적 코드입니다.
      const jsonBlob = new Blob([JSON.stringify(signupData)], {
        type: "application/json",
      });
      formData.append("request", jsonBlob);

      // 3. 파일이 있다면 추가 (키 이름은 보통 'file' 아니면 'image' 아니면 'profileImageUrl')
      // 명세서 필드명에 따라 'profileImageUrl'로 보냅니다.
      if (profileFile) {
        formData.append("profileImageUrl", profileFile);
      } else {
        // 파일이 없을 때 null을 보내야 에러가 안 나는 백엔드 구조일 수 있음
        // (필요 시 주석 해제)
        // formData.append("profileImageUrl", new Blob([], { type: 'application/json' })); 
      }

      console.log("🚀 [전송] FormData 구성 완료");

      const response = await axios.post(
        "/api/users/signup",
        formData,
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
            // Content-Type은 axios가 알아서 'multipart/form-data'로 설정함
          },
        }
      );

      // 성공 처리
      const accessToken =
        response.headers["authorization"]?.replace("Bearer ", "") ||
        response.data.data?.accessToken;
      const refreshToken =
        response.headers["refresh-token"] ||
        response.data.data?.refreshToken;

      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      localStorage.removeItem("tempToken");

      alert("회원가입 성공!");
      navigate("/home");

    } catch (error) {
      console.error("❌ 에러:", error);
      if (error.response) {
        const { status, data } = error.response;
        // 500 에러 상세 내용을 alert로 띄움
        alert(`서버 에러 (${status})\n${JSON.stringify(data, null, 2)}`);
        
        if (status === 409) navigate("/login");
      } else {
        alert("네트워크 오류 발생");
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
          <input type="file" accept="image/*" hidden onChange={handleProfileImageChange} />
        </label>

        <div className="form-section">
          <div className="input-group">
            <label>아이디</label>
            <input type="text" value={email} disabled className="disabled-input" />
          </div>
          <div className="input-group">
            <label>닉네임</label>
            <input name="nickname" placeholder="닉네임" value={form.nickname} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>생년월일</label>
            <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>자기소개</label>
            <textarea name="bio" placeholder="자기소개" value={form.bio} onChange={handleChange} />
          </div>
        </div>

        <button className="signup-button" onClick={handleSubmit}>회원가입</button>
      </div>
    </div>
  );
};

export default Signup;