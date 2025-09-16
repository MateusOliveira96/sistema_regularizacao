import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Map,
  MapPin,
  Search,
  Filter,
  Layers,
  ZoomIn,
  ZoomOut,
  Download,
  Building2,
  Navigation,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Ícones personalizados por status
const createCustomIcon = (status) => {
  const colors = {
    pending: '#EF4444',
    in_progress: '#F59E0B',
    municipal_registered: '#3B82F6',
    registry_completed: '#10B981',
  };

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${colors[status] || '#6B7280'};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Dados simulados de imóveis com coordenadas
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

// Componente para controles do mapa
function MapControls({ onZoomIn, onZoomOut, onSearch, onFilter }) {
  return (
    <div className="absolute top-4 right-4 z-[1000] space-y-2">
      <div className="bg-white rounded-lg shadow-lg p-2 space-y-1">
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomIn}
          className="w-8 h-8"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomOut}
          className="w-8 h-8"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-2 space-y-1">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="w-8 h-8">
              <Search className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Buscar no Mapa</SheetTitle>
              <SheetDescription>
                Encontre imóveis por endereço ou código
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="search">Endereço ou Código</Label>
                <Input
                  id="search"
                  placeholder="Digite o endereço ou código do imóvel..."
                />
              </div>
              <Button className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="w-8 h-8">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtros do Mapa</SheetTitle>
              <SheetDescription>
                Filtre imóveis por status e outras propriedades
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Status de Regularização</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                    <SelectItem value="municipal_registered">Cadastrado</SelectItem>
                    <SelectItem value="registry_completed">Regularizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Bairro</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os bairros" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="centro">Centro</SelectItem>
                    <SelectItem value="vila_nova">Vila Nova</SelectItem>
                    <SelectItem value="jardim_america">Jardim América</SelectItem>
                    <SelectItem value="sao_jose">São José</SelectItem>
                    <SelectItem value="santa_cruz">Santa Cruz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

// Componente para a legenda
function MapLegend() {
  const statusItems = [
    { status: 'pending', label: 'Pendente', color: '#EF4444' },
    { status: 'in_progress', label: 'Em Progresso', color: '#F59E0B' },
    { status: 'municipal_registered', label: 'Cadastrado', color: '#3B82F6' },
    { status: 'registry_completed', label: 'Regularizado', color: '#10B981' },
  ];

  return (
    <div className="absolute bottom-4 left-4 z-[1000]">
      <Card className="w-64">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Layers className="h-4 w-4" />
            Legenda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {statusItems.map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal do mapa
export default function MapView() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [filteredProperties, setFilteredProperties] = useState(mockProperties);
  const mapRef = useRef();

  // Coordenadas do centro de Mogi Mirim
  const center = [-22.4318, -46.9578];

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pendente', variant: 'destructive' },
      in_progress: { label: 'Em Progresso', variant: 'default' },
      municipal_registered: { label: 'Cadastrado', variant: 'secondary' },
      registry_completed: { label: 'Regularizado', variant: 'success' },
    };

    const config = statusMap[status] || { label: status, variant: 'secondary' };
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
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
            Exportar Mapa
          </Button>
        </div>
      </div>

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

      {/* Mapa */}
      <div className="relative">
        <Card>
          <CardContent className="p-0">
            <div className="h-[600px] relative">
              <MapContainer
                center={center}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {filteredProperties.map((property) => (
                  <Marker
                    key={property.id}
                    position={property.coordinates}
                    icon={createCustomIcon(property.status)}
                  >
                    <Popup>
                      <div className="space-y-2 min-w-[250px]">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-900">{property.code}</h3>
                          {getStatusBadge(property.status)}
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <p><strong>Endereço:</strong> {property.address}</p>
                          <p><strong>Área:</strong> {property.area} m²</p>
                          <p><strong>Proprietário:</strong> {property.owner}</p>
                          <p><strong>Etapa Atual:</strong> {property.step}</p>
                          <p><strong>Responsável:</strong> {property.responsible}</p>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <Button size="sm" className="w-full">
                            <Building2 className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              
              {/* Controles do mapa */}
              <MapControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
              />
              
              {/* Legenda */}
              <MapLegend />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de imóveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Imóveis no Mapa ({filteredProperties.length})
          </CardTitle>
          <CardDescription>
            Lista dos imóveis visualizados no mapa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 cursor-pointer"
                onClick={() => setSelectedProperty(property)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{property.code}</span>
                    {getStatusBadge(property.status)}
                  </div>
                  <p className="text-sm text-gray-600">{property.address}</p>
                  <p className="text-xs text-gray-500">
                    Área: {property.area} m² | Responsável: {property.responsible}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Navigation className="h-4 w-4 mr-2" />
                  Localizar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

