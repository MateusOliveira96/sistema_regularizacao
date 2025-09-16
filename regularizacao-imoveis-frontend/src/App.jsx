import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import SimpleLayout from './components/SimpleLayout';
import ProtectedRoute from './components/ProtectedRoute';
import SimpleLogin from './pages/SimpleLogin';
import SimpleDashboard from './pages/SimpleDashboard';
import SimpleReports from './pages/SimpleReports';
import SimpleMapView from './pages/SimpleMapView';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rota pública de login */}
          <Route path="/login" element={<SimpleLogin />} />
          
          {/* Rotas protegidas */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <SimpleLayout />
              </ProtectedRoute>
            }
          >
            {/* Rotas aninhadas dentro do layout */}
            <Route index element={<SimpleDashboard />} />
            <Route path="dashboard" element={<SimpleDashboard />} />
            
            {/* Placeholder para outras páginas */}
            <Route path="properties" element={<div className="p-8"><h1 className="text-2xl font-bold">Imóveis</h1><p>Página em desenvolvimento...</p></div>} />
            <Route path="steps" element={<div className="p-8"><h1 className="text-2xl font-bold">Etapas</h1><p>Página em desenvolvimento...</p></div>} />
            <Route path="documents" element={<div className="p-8"><h1 className="text-2xl font-bold">Documentos</h1><p>Página em desenvolvimento...</p></div>} />
            <Route path="reports" element={<SimpleReports />} />
            <Route path="map" element={<SimpleMapView />} />
            <Route 
              path="users" 
              element={
                <ProtectedRoute roles={['admin']}>
                  <div className="p-8"><h1 className="text-2xl font-bold">Usuários</h1><p>Página em desenvolvimento...</p></div>
                </ProtectedRoute>
              } 
            />
            
            {/* Página de não autorizado */}
            <Route 
              path="unauthorized" 
              element={
                <div className="p-8 text-center">
                  <h1 className="text-2xl font-bold text-destructive mb-4">Acesso Negado</h1>
                  <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
                </div>
              } 
            />
            
            {/* Página 404 */}
            <Route 
              path="*" 
              element={
                <div className="p-8 text-center">
                  <h1 className="text-2xl font-bold mb-4">Página Não Encontrada</h1>
                  <p className="text-muted-foreground">A página que você está procurando não existe.</p>
                </div>
              } 
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
