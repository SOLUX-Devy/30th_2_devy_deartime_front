import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";

import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import Home from "./pages/home.jsx";

/*개발 후 주석 풀어서 사용해주세요! -나연 */
/*import Gallery from "./pages/gallery";*/
import Letterbox from "./pages/letterboxPage";
/*import Timecapsule from "./pages/timecapsule";
import Freind from "./pages/freind"; */

export default function App() {
  return (
    <BrowserRouter>
      {/* 모든 페이지에 공통으로 들어가는 헤더 */}
      <Header /> 
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />

        {/* <Route path="/gallery" element={<Gallery />} /> */}
        <Route path="/letterbox" element={<Letterbox />} />
        {/* <Route path="/timecapsule" element={<Timecapsule />} /> */}
        {/* <Route path="/freind" element={<Freind />} /> */}
        
      </Routes>
    </BrowserRouter>
  );
}
