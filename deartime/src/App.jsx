import "./App.css";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/Header";

import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import Home from "./pages/home.jsx";

/*개발 후 주석 풀어서 사용해주세요! -나연 */
/*import Gallery from "./pages/gallery";*/
import Letterbox from "./pages/letterboxPage";
import SendLetterPage from "./pages/sendLetterPage";
import Timecapsule from "./pages/timecapsule";
import TimeCapsuleCreate from "./pages/TimeCapsuleCreate";
import TimeCapsuleDetail from "./pages/TimeCapsuleDetail";
import FriendList from "./pages/FriendList";
import FriendInvite from "./components/FriendInvite";

/* ✅ 여기 추가: FriendSelectPage import */
import FriendSelectPage from "./components/FriendSelect"; 
// 만약 pages에 있으면: import FriendSelectPage from "./pages/FriendSelect";

/** ✅ Header 고정 + 아래만 스크롤 되는 레이아웃 */
function AppLayout() {
  return (
    <div className="app-root">
      <Header />
      <main className="app-scroll-area">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ 로그인/회원가입은 헤더 없이 쓰고 싶으면 Layout 밖에 둠 */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ✅ 헤더 포함 + 스크롤 영역 적용 */}
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />

          {/* <Route path="/gallery" element={<Gallery />} /> */}
          <Route path="/letterbox/sendLetter" element={<SendLetterPage />} />
          <Route path="/letterbox" element={<Letterbox />} />

          <Route path="/timecapsule" element={<Timecapsule />} />
          <Route path="/timecapsule/create" element={<TimeCapsuleCreate />} />
          <Route path="/timecapsule/:capsuleId" element={<TimeCapsuleDetail />} />

          <Route path="/friend" element={<FriendList />} />
          <Route path="/friend/invite" element={<FriendInvite />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
