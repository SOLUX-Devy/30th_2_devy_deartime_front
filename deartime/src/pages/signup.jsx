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
    // profileImageUrl state는 이제 실제 파일 객체를 담거나 처리해야 하지만, 
    // 일단 텍스트 필드들과 로직을 맞춥니다.
  });

  const [profilePreview, setProfilePreview] = useState(defaultProfileImg);
  const [profileFile, setProfileFile] = useState(null); // 실제 파일 객체 저장용

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 미리보기 설정
    const previewUrl = URL.createObjectURL(file);
    setProfilePreview(previewUrl);
    
    // [중요] 나중에 전송을 위해 파일 객체 저장
    setProfileFile(file);
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
      // 2. [핵심 수정] JSON 대신 FormData 생성
      // 서버가 "multipart" 에러를 낸다는 건 이 방식을 원한다는 뜻입니다.
      const formData = new FormData();
      
      // (1) 닉네임 추가
      formData.append("nickname", form.nickname);

      // (2) 선택 정보들 (값이 있을 때만 추가)
      if (form.birthDate) {
        formData.append("birthDate", form.birthDate);
      }
      
      if (form.bio && form.bio.trim() !== "") {
        formData.append("bio", form.bio);
      }

      // (3) 프로필 이미지 처리
      // 만약 백엔드가 'profileImageUrl'이라는 문자열을 원하는 게 아니라
      // 실제 파일 업로드를 원한다면 아래처럼 파일을 보내야 합니다.
      // 일단 API 명세가 혼란스러우므로, 파일이 있으면 파일을 보내고
      // 없으면 아무것도 보내지 않거나, null 처리를 합니다.
      if (profileFile) {
        // 백엔드에서 받는 파일 파라미터 이름이 보통 'file' 아니면 'image' 입니다.
        // 명세서의 "profileImageUrl"이 문자열 필드라면 위처럼 텍스트로 보냈겠지만,
        // multipart 에러가 난 걸로 보아 파일 자체를 기대할 확률이 높습니다.
        // 혹시 모르니 명세서 필드명인 'profileImageUrl'로 파일을 넣어봅니다.
        // (안되면 'file'이나 'image'로 바꿔봐야 함)
        formData.append("profileImageUrl", profileFile); 
      }

      console.log("🚀 [FormData 전송]");
      // FormData는 console.log로 내용이 바로 안 보입니다. 확인하려면 아래 코드 필요
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await axios.post(
        "/api/users/signup",
        formData, // body 자리에 formData 넣기
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
            // [중요] Content-Type: application/json 을 지워야 합니다.
            // axios가 FormData를 감지하면 알아서 multipart/form-data로 설정합니다.
          },
        }
      );

      // 3. 성공 처리
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
      console.error("❌ 에러 발생:", error);

      if (error.response) {
        const { status, data } = error.response;
        console.log("🔥 서버 응답 데이터:", data);
        
        alert(`서버 에러 (${status})\n${JSON.stringify(data, null, 2)}`);
        
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