import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  ClipboardList,
  FileText,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function SimpleDashboard() {
  const [overview, setOverview] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [overdueSteps, setOverdueSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simular dados para demonstração
      setOverview({
        properties: {
          total: 150,
          pending: 25,
          in_progress: 85,
          municipal_registered: 30,
          registry_completed: 10
        },
        steps: {
          total: 750,
          active: 320,
          completed: 380,
          blocked: 50
        },
        documents: {
          total: 1250
        },
        users: {
          total: 12
        }
      });
      
      setRecentActivities([
        {
          id: 1,
          property_code: 'MM001-2024',
          property_address: 'Rua das Flores, 123',
          step_name: 'Levantamento Topográfico',
          status: 'completed',
          updated_at: '2024-01-15T10:30:00',
          responsible_user: 'João Silva'
        },
        {
          id: 2,
          property_code: 'MM002-2024',
          property_address: 'Av. Brasil, 456',
          step_name: 'Análise Documental',
          status: 'in_progress',
          updated_at: '2024-01-14T15:45:00',
          responsible_user: 'Maria Santos'
        }
      ]);
      
      setOverdueSteps([
        {
          step_record_id: 1,
          property_code: 'MM003-2024',
          property_address: 'Rua Central, 789',
          step_name: 'Vistoria Técnica',
          days_overdue: 5
        }
      ]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pendente', className: 'bg-gray-100 text-gray-800' },
      in_progress: { label: 'Em Progresso', className: 'bg-blue-100 text-blue-800' },
      municipal_registered: { label: 'Cadastrado', className: 'bg-yellow-100 text-yellow-800' },
      registry_completed: { label: 'Regularizado', className: 'bg-green-100 text-green-800' },
      completed: { label: 'Concluída', className: 'bg-green-100 text-green-800' },
      blocked: { label: 'Bloqueada', className: 'bg-red-100 text-red-800' },
    };

    const config = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados do dashboard: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Visão geral do sistema de regularização de imóveis
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Building2 className="h-4 w-4" />
              Total de Imóveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">{overview?.properties?.total || 0}</div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pendentes:</span>
                <span className="font-medium text-gray-900">{overview?.properties?.pending || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Em Progresso:</span>
                <span className="font-medium text-gray-900">{overview?.properties?.in_progress || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Regularizados:</span>
                <span className="font-medium text-gray-900">{overview?.properties?.registry_completed || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <ClipboardList className="h-4 w-4" />
              Etapas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">{overview?.steps?.active || 0}</div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Concluídas:</span>
                <span className="font-medium text-gray-900">{overview?.steps?.completed || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bloqueadas:</span>
                <span className="font-medium text-gray-900">{overview?.steps?.blocked || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <FileText className="h-4 w-4" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">{overview?.documents?.total || 0}</div>
            <p className="text-sm text-gray-600">Total de documentos anexados</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Users className="h-4 w-4" />
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">{overview?.users?.total || 0}</div>
            <p className="text-sm text-gray-600">Usuários cadastrados no sistema</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Etapas em Atraso */}
        {overdueSteps.length > 0 && (
          <Card className="lg:col-span-2 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Etapas em Atraso ({overdueSteps.length})
              </CardTitle>
              <CardDescription>
                Etapas que passaram do prazo estimado de conclusão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {overdueSteps.slice(0, 3).map((step) => (
                  <div key={step.step_record_id} className="flex items-start justify-between p-3 bg-white rounded-md border">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-gray-900">
                        {step.property_code} - {step.property_address}
                      </p>
                      <p className="text-sm text-gray-600">{step.step_name}</p>
                      <p className="text-sm font-medium text-red-600">
                        {step.days_overdue} dias em atraso
                      </p>
                    </div>
                    <Badge variant="destructive">Atrasado</Badge>
                  </div>
                ))}
              </div>
              {overdueSteps.length > 3 && (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/reports">
                    Ver todos os atrasos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas atualizações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-3 mb-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="p-3 bg-gray-50 rounded-md border">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">
                        {activity.property_code} - {activity.property_address}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        {activity.step_name} - {getStatusBadge(activity.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(activity.updated_at)}
                        {activity.responsible_user && (
                          <span className="ml-2 font-medium">
                            por {activity.responsible_user}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">Nenhuma atividade recente</p>
            )}
            
            <Button variant="outline" className="w-full" asChild>
              <Link to="/properties">
                Ver todos os imóveis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Links Rápidos */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Button asChild className="justify-start h-auto py-3">
                <Link to="/properties/new">
                  <Building2 className="mr-2 h-4 w-4" />
                  Cadastrar Imóvel
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start h-auto py-3">
                <Link to="/reports">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Ver Relatórios
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start h-auto py-3">
                <Link to="/map">
                  <Building2 className="mr-2 h-4 w-4" />
                  Visualizar Mapa
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

