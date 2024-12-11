import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Board from "./components/Board";
import Homepage from "./components/Homepage";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/game" element={<Board />} />
      </Routes>
    </Router>
  );
}

export default App;
