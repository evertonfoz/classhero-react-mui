import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoadingPage from './pages/LoadingPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import { PrivateRoute } from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { LayoutProvider } from './context/LayoutContext';
import UsersListPage from './pages/UsersListPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <LayoutProvider>
          <Routes>
            <Route path="/" element={<LoadingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Área protegida */}
            <Route
              path="/home"
              element={<PrivateRoute element={<HomePage />} />}
            >
              <Route index element={<UsersListPage />} />
              <Route path="usuarios" element={<UsersListPage />} />
              <Route path="perfil" element={<ProfilePage />} />

            </Route>

            {/* fallback */}
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </LayoutProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;