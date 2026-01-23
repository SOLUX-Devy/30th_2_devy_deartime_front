import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/sendLetter.css";

import theme1 from "../assets/bg-dark-blue.png";
import theme2 from "../assets/bg-light-blue.png";
import theme3 from "../assets/bg-light-grey.png";
import theme4 from "../assets/bg-light-pink.png";

import FriendSelect from "../components/FriendSelect";

const SendLetter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { friendId, friendNickname } = location.state || {};

  const themes = useMemo(
    () => [
      { id: 1, code: "theme1", imageUrl: theme1, text: "dark", button: "dark" },
      { id: 2, code: "theme2", imageUrl: theme2, text: "light", button: "light" },
      { id: 3, code: "theme3", imageUrl: theme3, text: "light", button: "light" },
      { id: 4, code: "theme4", imageUrl: theme4, text: "light", button: "light" },
    ],
    []
  );

  const [selectedThemeId, setSelectedThemeId] = useState(1);
  const currentTheme = themes.find((t) => t.id === selectedThemeId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [selectedFriend, setSelectedFriend] = useState(
    friendId ? { friendId, friendNickname } : null
  );

  const [isFriendSelectOpen, setIsFriendSelectOpen] = useState(false);

  const isFormValid =
    !!selectedFriend && title.trim() !== "" && content.trim() !== "";

  const handleFriendSelect = (friend) => {
    setSelectedFriend(friend); 
    setIsFriendSelectOpen(false);
  };

  const handleSend = async () => {
    if (!selectedFriend) {
      alert("받는 사람을 선택해주세요!");
      return;
    }
    if (!title.trim() || !content.trim()) return;

    const payload = {
      receiverId: selectedFriend.friendId,
      theme: currentTheme.code,
      title: title.trim(),
      content: content.trim(),
    };

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/");
        return;
      }

      console.log("[SendLetter payload]", payload);

      const res = await fetch(`${apiBaseUrl}/api/letters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch {
        console.warn("JSON 파싱 실패:", text);
      }

      if (!res.ok) {
        throw new Error(data?.message || "편지 전송 실패");
      }

      alert(`${selectedFriend.friendNickname}님에게 편지를 보냈습니다!`);
      navigate(-1);
    } catch (e) {
      console.error(e);
      alert(e.message || "편지 전송 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <div className="page-container">
        <div className="content-wrapper">
          <div className="glass-card">
            {/* 테마 선택 */}
            <div className="theme-sidebar">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className={`theme-option ${
                    selectedThemeId === theme.id ? "active" : ""
                  }`}
                  style={{ backgroundImage: `url(${theme.imageUrl})` }}
                  onClick={() => setSelectedThemeId(theme.id)}
                />
              ))}
            </div>

            {/* 편지 작성 */}
            <div
              className={`letter-editor text-${currentTheme.text} btn-${currentTheme.button}`}
              style={{ backgroundImage: `url(${currentTheme.imageUrl})` }}
            >
              <div className="editor-header">
                <h3>편지</h3>
                <button className="close-btn" onClick={() => navigate(-1)}>
                  ✕
                </button>
              </div>

              <div className="input-group">
                <div className="input-row">
                  <span className="label">받는 사람</span>

                  <span
                    className={`
                      receiver-name
                      ${selectedFriend ? "selected" : "placeholder"}
                      ${currentTheme.text === "dark" ? "dark" : "light"}
                    `}
                  >
                    {selectedFriend
                      ? selectedFriend.friendNickname
                      : "선택 안 됨"}
                  </span>

                  {/* ✅ 언제든 변경 가능 */}
                  <button
                    className="arrow-btn"
                    onClick={() => setIsFriendSelectOpen(true)}
                    type="button"
                  >
                    〉
                  </button>
                </div>

                <div className="input-row">
                  <input
                    type="text"
                    placeholder="제목"
                    className="title-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="input-row content-row">
                  <div className="textarea-container">
                    <textarea
                      placeholder="내용을 입력하세요"
                      className="text-input"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="editor-footer">
                <button
                  className={`send-btn ${currentTheme.button}`}
                  onClick={handleSend}
                  disabled={!isFormValid}
                  style={{
                    opacity: isFormValid ? 1 : 0.5,
                    cursor: isFormValid ? "pointer" : "not-allowed",
                  }}
                >
                  보내기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isFriendSelectOpen && (
        <FriendSelect
          onClose={() => setIsFriendSelectOpen(false)}
          onSelect={handleFriendSelect}
        />
      )}
    </>
  );
};

export default SendLetter;