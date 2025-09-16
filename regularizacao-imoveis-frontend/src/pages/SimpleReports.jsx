import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Download,
  Calendar,
  AlertTriangle,
  Building2,
  ClipboardList,
  MapPin,
  Clock,
} from 'lucide-react';

export default function SimpleReports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dados simulados para demonstração
  const [dashboardData] = useState({
    propertiesByStatus: [
      { name: 'Pendente', value: 25, percentage: 16.7 },
      { name: 'Em Progresso', value: 85, percentage: 56.7 },
      { name: 'Cadastrado', value: 30, percentage: 20.0 },
      { name: 'Regularizado', value: 10, percentage: 6.7 },
    ],
    propertiesByNeighborhood: [
      { neighborhood: 'Centro', total: 35, completed: 8, in_progress: 20, pending: 7 },
      { neighborhood: 'Vila Nova', total: 28, completed: 5, in_progress: 18, pending: 5 },
      { neighborhood: 'Jardim América', total: 22, completed: 3, in_progress: 15, pending: 4 },
      { neighborhood: 'São José', total: 18, completed: 2, in_progress: 12, pending: 4 },
      { neighborhood: 'Santa Cruz', total: 15, completed: 1, in_progress: 10, pending: 4 },
      { neighborhood: 'Outros', total: 32, completed: 1, in_progress: 10, pending: 21 },
    ],
    overdueSteps: [
      {
        property_code: 'MM001-2024',
        property_address: 'Rua das Flores, 123',
        step_name: 'Levantamento Topográfico',
        days_overdue: 15,
        responsible: 'João Silva'
      },
      {
        property_code: 'MM005-2024',
        property_address: 'Av. Brasil, 456',
        step_name: 'Vistoria Técnica',
        days_overdue: 8,
        responsible: 'Maria Santos'
      },
      {
        property_code: 'MM012-2024',
        property_address: 'Rua Central, 789',
        step_name: 'Análise Documental',
        days_overdue: 5,
        responsible: 'Pedro Costa'
      },
    ],
    performanceMetrics: {
      averageCompletionTime: 45,
      completionRate: 6.7,
      productivityTrend: 12.5,
      bottleneckStep: 'Aprovação Municipal'
    }
  });

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const exportReport = (format) => {
    alert(`Exportando relatório em formato ${format}...`);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pendente': 'bg-red-100 text-red-800',
      'Em Progresso': 'bg-yellow-100 text-yellow-800',
      'Cadastrado': 'bg-blue-100 text-blue-800',
      'Regularizado': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p>Carregando relatórios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados dos relatórios: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios e Analytics</h1>
          <p className="text-gray-600">
            Análise detalhada do progresso de regularização de imóveis
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => exportReport('PDF')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Clock className="h-4 w-4" />
              Tempo Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData.performanceMetrics.averageCompletionTime} dias
            </div>
            <p className="text-sm text-gray-600">Para conclusão completa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <TrendingUp className="h-4 w-4" />
              Taxa de Conclusão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData.performanceMetrics.completionRate}%
            </div>
            <p className="text-sm text-green-600">
              +{dashboardData.performanceMetrics.productivityTrend}% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <AlertTriangle className="h-4 w-4" />
              Etapas em Atraso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardData.overdueSteps.length}
            </div>
            <p className="text-sm text-gray-600">Requerem atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <ClipboardList className="h-4 w-4" />
              Gargalo Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-gray-900">
              {dashboardData.performanceMetrics.bottleneckStep}
            </div>
            <p className="text-sm text-gray-600">Etapa mais demorada</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribuição por Status
            </CardTitle>
            <CardDescription>
              Status atual dos imóveis em regularização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.propertiesByStatus.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ 
                        backgroundColor: index === 0 ? '#EF4444' : 
                                       index === 1 ? '#F59E0B' : 
                                       index === 2 ? '#3B82F6' : '#10B981' 
                      }}
                    ></div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{item.value}</div>
                    <div className="text-sm text-gray-500">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Bairro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Distribuição por Bairro
            </CardTitle>
            <CardDescription>
              Concentração de imóveis por região da cidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.propertiesByNeighborhood.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.neighborhood}</span>
                    <span className="text-sm text-gray-500">Total: {item.total}</span>
                  </div>
                  <div className="flex gap-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500"
                      style={{ width: `${(item.completed / item.total) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-yellow-500"
                      style={{ width: `${(item.in_progress / item.total) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-red-500"
                      style={{ width: `${(item.pending / item.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Regularizados: {item.completed}</span>
                    <span>Em Progresso: {item.in_progress}</span>
                    <span>Pendentes: {item.pending}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Etapas em Atraso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Etapas em Atraso
          </CardTitle>
          <CardDescription>
            Lista detalhada de etapas que ultrapassaram o prazo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.overdueSteps.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="destructive" className="text-xs">
                      {item.days_overdue} dias
                    </Badge>
                    <span className="font-medium text-gray-900">
                      {item.property_code}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {item.property_address}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {item.step_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Responsável: {item.responsible}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Ver Detalhes
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle>Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">Regularizado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Cadastrado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Em Progresso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm">Pendente</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

