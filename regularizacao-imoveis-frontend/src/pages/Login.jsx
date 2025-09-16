import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Eye, EyeOff } from 'lucide-react';
import './Login.css';

export default function Login() {
  const { user, login, loading, error } = useAuth();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Se já está logado, redirecionar
  if (user) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
    } catch (error) {
      // Erro já é tratado no hook useAuth
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <Card className="login-card">
          <CardHeader className="login-header">
            <div className="login-logo">
              <Building2 className="logo-icon" />
            </div>
            <CardTitle className="login-title">
              Sistema de Regularização de Imóveis
            </CardTitle>
            <CardDescription className="login-description">
              Prefeitura Municipal de Mogi Mirim
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <Alert variant="destructive" className="login-error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="form-group">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu.email@mogimimirim.sp.gov.br"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <Label htmlFor="password">Senha</Label>
                <div className="password-input">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Digite sua senha"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
            
            <div className="login-footer">
              <p className="login-help">
                Problemas para acessar? Entre em contato com o administrador do sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

