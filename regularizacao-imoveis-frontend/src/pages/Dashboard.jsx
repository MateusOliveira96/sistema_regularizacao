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
import './Dashboard.css';

export default function Dashboard() {
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
      const [overviewData, activitiesData, overdueData] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getRecentActivities({ limit: 5 }),
        dashboardService.getOverdueSteps(),
      ]);

      setOverview(overviewData);
      setRecentActivities(activitiesData.recent_activities || []);
      setOverdueSteps(overdueData.overdue_steps || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pendente', variant: 'secondary' },
      in_progress: { label: 'Em Progresso', variant: 'default' },
      municipal_registered: { label: 'Cadastrado', variant: 'outline' },
      registry_completed: { label: 'Regularizado', variant: 'success' },
      completed: { label: 'Concluída', variant: 'success' },
      blocked: { label: 'Bloqueada', variant: 'destructive' },
    };

    const config = statusMap[status] || { label: status, variant: 'secondary' };
    return (
      <Badge variant={config.variant} className="status-badge">
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="dashboard-error">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados do dashboard: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">
          Visão geral do sistema de regularização de imóveis
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="stats-grid">
        <Card className="stat-card">
          <CardHeader className="stat-header">
            <CardTitle className="stat-title">
              <Building2 className="stat-icon" />
              Total de Imóveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">{overview?.properties?.total || 0}</div>
            <div className="stat-breakdown">
              <div className="stat-item">
                <span className="stat-label">Pendentes:</span>
                <span className="stat-number">{overview?.properties?.pending || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Em Progresso:</span>
                <span className="stat-number">{overview?.properties?.in_progress || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Regularizados:</span>
                <span className="stat-number">{overview?.properties?.registry_completed || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="stat-header">
            <CardTitle className="stat-title">
              <ClipboardList className="stat-icon" />
              Etapas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">{overview?.steps?.active || 0}</div>
            <div className="stat-breakdown">
              <div className="stat-item">
                <span className="stat-label">Concluídas:</span>
                <span className="stat-number">{overview?.steps?.completed || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Bloqueadas:</span>
                <span className="stat-number">{overview?.steps?.blocked || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="stat-header">
            <CardTitle className="stat-title">
              <FileText className="stat-icon" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">{overview?.documents?.total || 0}</div>
            <p className="stat-description">Total de documentos anexados</p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="stat-header">
            <CardTitle className="stat-title">
              <Users className="stat-icon" />
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">{overview?.users?.total || 0}</div>
            <p className="stat-description">Usuários cadastrados no sistema</p>
          </CardContent>
        </Card>
      </div>

      <div className="dashboard-content">
        {/* Etapas em Atraso */}
        {overdueSteps.length > 0 && (
          <Card className="overdue-card">
            <CardHeader>
              <CardTitle className="overdue-title">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Etapas em Atraso ({overdueSteps.length})
              </CardTitle>
              <CardDescription>
                Etapas que passaram do prazo estimado de conclusão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overdue-list">
                {overdueSteps.slice(0, 3).map((step) => (
                  <div key={step.step_record_id} className="overdue-item">
                    <div className="overdue-info">
                      <p className="overdue-property">
                        {step.property_code} - {step.property_address}
                      </p>
                      <p className="overdue-step">{step.step_name}</p>
                      <p className="overdue-days">
                        {step.days_overdue} dias em atraso
                      </p>
                    </div>
                    <Badge variant="destructive">Atrasado</Badge>
                  </div>
                ))}
              </div>
              {overdueSteps.length > 3 && (
                <Button variant="outline" className="view-all-button" asChild>
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
        <Card className="activities-card">
          <CardHeader>
            <CardTitle className="activities-title">
              <Clock className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas atualizações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="activities-list">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-info">
                      <p className="activity-property">
                        {activity.property_code} - {activity.property_address}
                      </p>
                      <p className="activity-step">
                        {activity.step_name} - {getStatusBadge(activity.status)}
                      </p>
                      <p className="activity-date">
                        {formatDate(activity.updated_at)}
                        {activity.responsible_user && (
                          <span className="activity-user">
                            por {activity.responsible_user}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-activities">Nenhuma atividade recente</p>
            )}
            
            <Button variant="outline" className="view-all-button" asChild>
              <Link to="/properties">
                Ver todos os imóveis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Links Rápidos */}
        <Card className="quick-links-card">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="quick-links">
              <Button asChild className="quick-link">
                <Link to="/properties/new">
                  <Building2 className="mr-2 h-4 w-4" />
                  Cadastrar Imóvel
                </Link>
              </Button>
              <Button variant="outline" asChild className="quick-link">
                <Link to="/reports">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Ver Relatórios
                </Link>
              </Button>
              <Button variant="outline" asChild className="quick-link">
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

