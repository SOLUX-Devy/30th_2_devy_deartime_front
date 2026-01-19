import { useState, useEffect } from "react";
import { UserContext } from "./UserContext";

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      let token = localStorage.getItem("accessToken");

      // 1. 토큰이 없으면 로딩 끝내고 리턴
      if (!token) {
        console.warn("[UserProvider] 토큰이 없습니다.");
        setLoading(false);
        return;
      }

      //토큰에 포함된 따옴표 제거 (400 에러 방지)
      token = token.replace(/"/g, "");

      try {
        const res = await fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`, // 공백 주의
            "Content-Type": "application/json",
          },
        });

        const json = await res.json();

        if (res.ok && json.success) {
          setUser(json.data); // 서버 응답 구조에 맞게 설정 (json.data 등)
          console.log("[UserProvider] 유저 정보 로드 성공:", json.data);
        } else {
          console.error("[UserProvider] 유저 정보 로드 실패:", json);
          // 토큰이 만료되었거나 유효하지 않으면 로그아웃 처리
          if (res.status === 401 || res.status === 400) {
            localStorage.removeItem("accessToken");
          }
          setUser(null);
        }
      } catch (err) {
        console.error("[UserProvider] 네트워크 에러:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}