import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoadingPage from './pages/LoadingPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/home/HomePage';
import { PrivateRoute } from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { LayoutProvider } from './context/LayoutContext';
import UsersListPage from './pages/users/UsersListPage';
import ProfilePage from './pages/profile/ProfilePage';
import CoursesListPage from './pages/courses/CoursesListPage';
import CourseFormPage from './pages/courses/CourseFormPage';
import DisciplinesListPage from './pages/disciplines/DisciplinesListPage';
import DisciplinesFormPage from './pages/disciplines/DisciplinesFormPage';

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
              <Route path="perfil/:email?" element={<ProfilePage />} />
              <Route path="cursos" element={<CoursesListPage />} />
              <Route path="cursos/novo" element={<CourseFormPage />} />
              <Route path="cursos/editar/:id" element={<CourseFormPage />} />
              <Route path="disciplinas" element={<DisciplinesListPage />} />
              <Route path="disciplinas/nova" element={<DisciplinesFormPage />} />
              {/* <Route path="disciplinas/editar/:id" element={<DisciplinesFormPage />} /> */}
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
