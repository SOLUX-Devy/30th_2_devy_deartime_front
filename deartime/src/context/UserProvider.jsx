import { useState, useEffect } from "react";
import { UserContext } from "./UserContext";

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");
      console.log("[UserProvider] token:", token); // 토큰 확인
      if (!token) {
        console.warn("[UserProvider] No token found in localStorage");
        setTimeout(() => setLoading(false), 0); // 동기 setState 방지
        return;
      }

      try {
        console.log("[UserProvider] Fetching user info from /api/users/me...");
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("[UserProvider] Response status:", res.status);

        const json = await res.json();
        console.log("[UserProvider] Response JSON:", json);

        if (res.ok && json.success) {
          // 서버 구조에 맞게 data만 setUser
          setUser(json.data);
          console.log("[UserProvider] User set successfully:", json.data);
        } else {
          console.warn("[UserProvider] Failed to fetch user info:", json);
          setUser(null);
        }
      } catch (err) {
        console.error("[UserProvider] Error fetching user info:", err);
        setUser(null);
      } finally {
        setLoading(false);
        console.log("[UserProvider] Loading finished");
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div>로딩중...</div>;

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
