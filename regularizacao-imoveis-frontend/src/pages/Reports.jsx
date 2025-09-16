import { useState, useEffect } from 'react';
import { dashboardService } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
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

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('last_6_months');
  
  // Dados simulados para demonstração
  const [dashboardData, setDashboardData] = useState({
    propertiesByStatus: [
      { name: 'Pendente', value: 25, color: '#EF4444' },
      { name: 'Em Progresso', value: 85, color: '#F59E0B' },
      { name: 'Cadastrado', value: 30, color: '#3B82F6' },
      { name: 'Regularizado', value: 10, color: '#10B981' },
    ],
    propertiesByNeighborhood: [
      { neighborhood: 'Centro', total: 35, completed: 8, in_progress: 20, pending: 7 },
      { neighborhood: 'Vila Nova', total: 28, completed: 5, in_progress: 18, pending: 5 },
      { neighborhood: 'Jardim América', total: 22, completed: 3, in_progress: 15, pending: 4 },
      { neighborhood: 'São José', total: 18, completed: 2, in_progress: 12, pending: 4 },
      { neighborhood: 'Santa Cruz', total: 15, completed: 1, in_progress: 10, pending: 4 },
      { neighborhood: 'Outros', total: 32, completed: 1, in_progress: 10, pending: 21 },
    ],
    monthlyProgress: [
      { month: 'Jul/23', completed: 2, started: 8, total: 140 },
      { month: 'Ago/23', completed: 3, started: 12, total: 142 },
      { month: 'Set/23', completed: 1, started: 15, total: 143 },
      { month: 'Out/23', completed: 4, started: 10, total: 147 },
      { month: 'Nov/23', completed: 2, started: 18, total: 149 },
      { month: 'Dez/23', completed: 3, started: 8, total: 152 },
    ],
    stepsProgress: [
      { step: 'Levantamento Topográfico', completed: 45, in_progress: 25, pending: 80 },
      { step: 'Análise Documental', completed: 38, in_progress: 30, pending: 82 },
      { step: 'Vistoria Técnica', completed: 32, in_progress: 28, pending: 90 },
      { step: 'Aprovação Municipal', completed: 25, in_progress: 20, pending: 105 },
      { step: 'Registro Cartório', completed: 10, in_progress: 15, pending: 125 },
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
    loadReportsData();
  }, [selectedPeriod]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const exportReport = (format) => {
    // Implementar exportação
    alert(`Exportando relatório em formato ${format}...`);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_month">Último mês</SelectItem>
              <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
              <SelectItem value="last_6_months">Últimos 6 meses</SelectItem>
              <SelectItem value="last_year">Último ano</SelectItem>
              <SelectItem value="all_time">Todo período</SelectItem>
            </SelectContent>
          </Select>
          
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

      {/* Tabs com diferentes visualizações */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="geographic">Geográfico</TabsTrigger>
          <TabsTrigger value="overdue">Atrasos</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Status */}
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
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.propertiesByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dashboardData.propertiesByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Progresso das Etapas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Progresso das Etapas
                </CardTitle>
                <CardDescription>
                  Status de cada etapa do processo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.stepsProgress} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="step" type="category" width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="completed" stackId="a" fill="#10B981" name="Concluídas" />
                    <Bar dataKey="in_progress" stackId="a" fill="#F59E0B" name="Em Progresso" />
                    <Bar dataKey="pending" stackId="a" fill="#EF4444" name="Pendentes" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progresso Temporal */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Evolução Mensal
              </CardTitle>
              <CardDescription>
                Progresso de conclusões e novos cadastros ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={dashboardData.monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.1}
                    name="Total Acumulado"
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="Concluídos"
                  />
                  <Line
                    type="monotone"
                    dataKey="started"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    name="Iniciados"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análise Geográfica */}
        <TabsContent value="geographic" className="space-y-6">
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
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dashboardData.propertiesByNeighborhood}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="neighborhood" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#10B981" name="Regularizados" />
                  <Bar dataKey="in_progress" stackId="a" fill="#F59E0B" name="Em Progresso" />
                  <Bar dataKey="pending" stackId="a" fill="#EF4444" name="Pendentes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Etapas em Atraso */}
        <TabsContent value="overdue" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

