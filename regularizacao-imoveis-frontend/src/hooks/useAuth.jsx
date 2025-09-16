import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../lib/api';

// Contexto de autenticação
const AuthContext = createContext();

// Provider de autenticação
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar se há usuário logado ao carregar a aplicação
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await authService.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      // Se não conseguir obter usuário, não está logado
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
    }
  };

  const changePassword = async (data) => {
    try {
      setError(null);
      const response = await authService.changePassword(data);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === 'string') {
      return user.role === roles;
    }
    return roles.includes(user.role);
  };

  const isAdmin = () => hasRole('admin');
  const isManager = () => hasRole(['admin', 'manager']);
  const isOperator = () => hasRole(['admin', 'manager', 'operator']);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    changePassword,
    checkAuth,
    hasRole,
    isAdmin,
    isManager,
    isOperator,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

