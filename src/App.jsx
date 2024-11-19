import './App.css';
import Dashboard from './Dashboard';
import BruteForceDetection from './pages/BruteForceDetection';
import DdosDetection from './pages/DdosDetection';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        <Route
          path="/brute-force-detection"
          element={<ProtectedRoute element={<BruteForceDetection />} />}
        />
        <Route
          path="/ddos-detection"
          element={<ProtectedRoute element={<DdosDetection />} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
