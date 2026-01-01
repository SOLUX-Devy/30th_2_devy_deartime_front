import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";

import Home from "./pages/home";
import Gallery from "./pages/gallery";
import Letterbox from "./pages/letterboxPage";
import Timecapsule from "./pages/timecapsule";
import Freind from "./pages/freind";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/letterbox" element={<Letterbox />} />
        <Route path="/timecapsule" element={<Timecapsule />} />
        <Route path="/freind" element={<Freind />} />
      </Routes>
    </BrowserRouter>
  );
}
