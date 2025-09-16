import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Map,
  MapPin,
  Search,
  Filter,
  Layers,
  Download,
  Building2,
  Navigation,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

// Dados simulados de imóveis
const mockProperties = [
  {
    id: 1,
    code: 'MM001-2024',
    address: 'Rua das Flores, 123 - Centro',
    status: 'in_progress',
    coordinates: [-22.4318, -46.9578],
    area: 500.0,
    owner: 'Prefeitura Municipal',
    step: 'Levantamento Topográfico',
    responsible: 'João Silva'
  },
  {
    id: 2,
    code: 'MM002-2024',
    address: 'Av. Brasil, 456 - Vila Nova',
    status: 'pending',
    coordinates: [-22.4325, -46.9585],
    area: 750.0,
    owner: 'Prefeitura Municipal',
    step: 'Análise Documental',
    responsible: 'Maria Santos'
  },
  {
    id: 3,
    code: 'MM003-2024',
    address: 'Rua Central, 789 - Jardim América',
    status: 'municipal_registered',
    coordinates: [-22.4310, -46.9570],
    area: 300.0,
    owner: 'Prefeitura Municipal',
    step: 'Aprovação Municipal',
    responsible: 'Pedro Costa'
  },
  {
    id: 4,
    code: 'MM004-2024',
    address: 'Rua São José, 321 - São José',
    status: 'registry_completed',
    coordinates: [-22.4330, -46.9590],
    area: 400.0,
    owner: 'Prefeitura Municipal',
    step: 'Registro Cartório',
    responsible: 'Ana Silva'
  },
  {
    id: 5,
    code: 'MM005-2024',
    address: 'Av. Independência, 654 - Santa Cruz',
    status: 'in_progress',
    coordinates: [-22.4300, -46.9560],
    area: 600.0,
    owner: 'Prefeitura Municipal',
    step: 'Vistoria Técnica',
    responsible: 'Carlos Lima'
  },
];

export default function SimpleMapView() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [filteredProperties, setFilteredProperties] = useState(mockProperties);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pendente', className: 'bg-red-100 text-red-800' },
      in_progress: { label: 'Em Progresso', className: 'bg-yellow-100 text-yellow-800' },
      municipal_registered: { label: 'Cadastrado', className: 'bg-blue-100 text-blue-800' },
      registry_completed: { label: 'Regularizado', className: 'bg-green-100 text-green-800' },
    };

    const config = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#EF4444',
      in_progress: '#F59E0B',
      municipal_registered: '#3B82F6',
      registry_completed: '#10B981',
    };
    return colors[status] || '#6B7280';
  };

  const handleSearch = () => {
    let filtered = mockProperties;
    
    if (searchTerm) {
      filtered = filtered.filter(property => 
        property.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(property => property.status === statusFilter);
    }
    
    setFilteredProperties(filtered);
  };

  const openGoogleMaps = (coordinates, address) => {
    const [lat, lng] = coordinates;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mapa de Imóveis</h1>
          <p className="text-gray-600">
            Visualização geográfica dos imóveis em processo de regularização
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Lista
          </Button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca e Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Imóvel</Label>
              <Input
                id="search"
                placeholder="Código ou endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="municipal_registered">Cadastrado</SelectItem>
                  <SelectItem value="registry_completed">Regularizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-lg font-bold">
                  {filteredProperties.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Em Progresso</p>
                <p className="text-lg font-bold">
                  {filteredProperties.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Cadastrados</p>
                <p className="text-lg font-bold">
                  {filteredProperties.filter(p => p.status === 'municipal_registered').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Regularizados</p>
                <p className="text-lg font-bold">
                  {filteredProperties.filter(p => p.status === 'registry_completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mapa Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Visualização no Mapa
          </CardTitle>
          <CardDescription>
            Mapa interativo dos imóveis (em desenvolvimento)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center space-y-4">
              <Map className="h-16 w-16 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Mapa WebGIS</h3>
                <p className="text-gray-600">
                  Visualização interativa dos imóveis será implementada aqui
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Funcionalidades: marcadores por status, popup com detalhes, filtros geográficos
                </p>
              </div>
              <Button variant="outline">
                <Layers className="h-4 w-4 mr-2" />
                Configurar Camadas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de imóveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Imóveis Encontrados ({filteredProperties.length})
          </CardTitle>
          <CardDescription>
            Lista dos imóveis que atendem aos critérios de busca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum imóvel encontrado com os filtros aplicados.</p>
              </div>
            ) : (
              filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: getStatusColor(property.status) }}
                      ></div>
                      <span className="font-medium text-gray-900">{property.code}</span>
                      {getStatusBadge(property.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{property.address}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                      <span>Área: {property.area} m²</span>
                      <span>Etapa: {property.step}</span>
                      <span>Responsável: {property.responsible}</span>
                      <span>Coordenadas: {property.coordinates[0].toFixed(4)}, {property.coordinates[1].toFixed(4)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openGoogleMaps(property.coordinates, property.address)}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Ver no Mapa
                    </Button>
                    <Button variant="outline" size="sm">
                      <Building2 className="h-4 w-4 mr-2" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Legenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
              <span className="text-sm">Pendente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow-sm"></div>
              <span className="text-sm">Em Progresso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
              <span className="text-sm">Cadastrado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              <span className="text-sm">Regularizado</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações técnicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Técnicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Funcionalidades Planejadas</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Mapa interativo com Leaflet/OpenLayers</li>
                <li>• Marcadores personalizados por status</li>
                <li>• Popup com informações detalhadas</li>
                <li>• Filtros geográficos e por atributos</li>
                <li>• Ferramentas de medição</li>
                <li>• Exportação de mapas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Tecnologias</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• React + Leaflet para mapas interativos</li>
                <li>• PostGIS para dados geoespaciais</li>
                <li>• OpenStreetMap como base cartográfica</li>
                <li>• Integração com Google Maps</li>
                <li>• Suporte a coordenadas UTM/WGS84</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

