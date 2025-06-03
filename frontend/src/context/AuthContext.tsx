import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  name: string;
  email: string;
  is_a_admin: boolean;
  is_a_teacher: boolean;
  is_a_student: boolean;
  is_validated: boolean;
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: (token: string, email: string) => void;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void; // ✅ Novo
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedEmail = localStorage.getItem('user_email');

    if (storedToken && storedEmail) {
      setToken(storedToken);
      setIsAuthenticated(true);

      fetch(`http://localhost:3000/users/by-email?email=${encodeURIComponent(storedEmail)}`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      })
        .then((res) => res.json())
        .then((result) => {
          const userData = result.data;
          setUser({
            name: userData.name ?? '',
            email: userData.email ?? '',
            is_a_admin: userData.is_a_admin ?? false,
            is_a_teacher: userData.is_a_teacher ?? false,
            is_a_student: userData.is_a_student ?? false,
            is_validated: userData.is_validated ?? false,
            avatar: Array.isArray(userData.users_avatars)
              ? userData.users_avatars.find((a: any) => a.is_active)?.avatar_url ?? ''
              : userData.users_avatars?.is_active
              ? userData.users_avatars.avatar_url
              : '',
          });
        })
        .catch(() => {
          setUser(null);
        });
    }
  }, []);

  const login = (newToken: string, email: string) => {
    localStorage.setItem('access_token', newToken);
    localStorage.setItem('user_email', email);
    setToken(newToken);
    setIsAuthenticated(true);

    fetch(`http://localhost:3000/users/by-email?email=${encodeURIComponent(email)}`, {
      headers: {
        Authorization: `Bearer ${newToken}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        const userData = result.data;
        setUser({
          name: userData.name ?? '',
          email: userData.email ?? '',
          is_a_admin: userData.is_a_admin ?? false,
          is_a_teacher: userData.is_a_teacher ?? false,
          is_a_student: userData.is_a_student ?? false,
          is_validated: userData.is_validated ?? false,
          avatar: Array.isArray(userData.users_avatars)
            ? userData.users_avatars.find((a: any) => a.is_active)?.avatar_url ?? ''
            : userData.users_avatars?.is_active
            ? userData.users_avatars.avatar_url
            : '',
        });
      });

    navigate('/home');
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const updateUser = (updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : prev));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro do AuthProvider');
  return context;
};
