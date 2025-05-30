import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingPage from './pages/LoadingPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoadingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
