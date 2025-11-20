import './App.css';
import Dashboard from './Dashboard';
import AdvancedDashboard from './AdvancedDashboard';
import BruteForceDetection from './pages/BruteForceDetection';
import DdosDetection from './pages/DdosDetection';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
          element={<ProtectedRoute element={<AdvancedDashboard />} />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        <Route
          path="/advanced-dashboard"
          element={<ProtectedRoute element={<AdvancedDashboard />} />}
        />
        <Route
          path="/brute-force-detection"
          element={<ProtectedRoute element={<BruteForceDetection />} />}
        />
        <Route
          path="/ddos-detection"
          element={<ProtectedRoute element={<DdosDetection />} />}
        />
        
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;