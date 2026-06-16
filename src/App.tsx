import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Clients from "@/pages/Clients";
import Schedule from "@/pages/Schedule";
import Diary from "@/pages/Diary";
import Materials from "@/pages/Materials";
import Review from "@/pages/Review";
import Alerts from "@/pages/Alerts";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="clients" element={<Clients />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="diary" element={<Diary />} />
          <Route path="materials" element={<Materials />} />
          <Route path="review" element={<Review />} />
          <Route path="alerts" element={<Alerts />} />
        </Route>
      </Routes>
    </Router>
  );
}
