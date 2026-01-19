import { useState, useEffect } from "react";
import { UserContext } from "./UserContext"; 

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      let token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      token = token.replace(/"/g, "");

      try {
        const res = await fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const json = await res.json();

        if (res.ok && json.success) {
          setUser(json.data);
        } else {
          if (res.status === 401 || res.status === 400) {
            localStorage.removeItem("accessToken");
          }
          setUser(null);
        }
      } catch (err) {
        console.error(err);
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