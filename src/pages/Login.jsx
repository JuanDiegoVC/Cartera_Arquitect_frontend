import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import logo from '../assets/Logo1.png';
import logo2 from '../assets/LogoSotrac-Photoroom.png';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { refreshTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Cargar el tema del usuario después del login exitoso
      await refreshTheme();
      navigate('/');
    } catch (err) {
      setError(err.detail || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-background min-h-screen flex items-center justify-center p-4">
      <div className="login-container w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={logo} alt="Logo Sotrapeñol" className="login-logo w-24 h-24 object-contain" />
          </div>
          <img src={logo2} alt="Sotrapeñol" className="h-16 w-auto object-contain mx-auto" />
          <p className="text-muted-foreground mt-2">Sistema de Gestión de Recaudos</p>
        </div>

        <Card className="login-card shadow-xl">
          <CardHeader className="login-card-header space-y-1">
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="login-label">Correo Electrónico</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="usuario@sotrap.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                  className="login-input h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="login-label">Contraseña</Label>
                <Input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="login-input h-11"
                />
              </div>

              {error && (
                <Alert variant="destructive" className="login-alert-error">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="login-button w-full h-11 text-base" size="lg">
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="login-footer text-center text-sm text-muted-foreground mt-6 pt-4">
          © 2025 Sotrapeñol. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
