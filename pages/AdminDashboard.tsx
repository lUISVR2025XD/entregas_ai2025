import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Profile, Order, OrderStatus } from '../types';
import { APP_NAME, MOCK_USER_LOCATION } from '../constants';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Users, Bike, Briefcase, Activity } from 'lucide-react';
import StatsCard from '../components/ui/StatsCard';

interface AdminDashboardProps {
  user: Profile;
  onLogout: () => void;
}

const MOCK_LIVE_ORDERS: Order[] = [
    {
        id: 'order-123', client_id: 'client-1', business_id: 'business-1', delivery_person_id: 'delivery-1',
        items: [], total_price: 155, status: OrderStatus.ON_THE_WAY, delivery_address: '',
        delivery_location: { lat: 19.4350, lng: -99.1350 },
        business: { id: 'business-1', name: 'Taquería El Pastor', location: { lat: 19.4300, lng: -99.1300 }, category: '', delivery_fee: 0, delivery_time: '', image: '', is_open: true, phone: '', address: '', email: '', rating: 0 },
        delivery_person: { id: 'delivery-1', name: 'Pedro R.', location: { lat: 19.4325, lng: -99.1325 }, is_online: true, vehicle: '', current_deliveries: 0, email: '', phone: '', rating: 0 },
        created_at: new Date().toISOString(),
    },
    {
        id: 'order-125', client_id: 'client-3', business_id: 'business-2',
        items: [], total_price: 225, status: OrderStatus.READY_FOR_PICKUP, delivery_address: '',
        delivery_location: { lat: 19.4250, lng: -99.1450 },
        business: { id: 'business-2', name: 'Sushi Express', location: { lat: 19.4350, lng: -99.1400 }, category: '', delivery_fee: 0, delivery_time: '', image: '', is_open: true, phone: '', address: '', email: '', rating: 0 },
        created_at: new Date().toISOString(),
    }
];

type AdminView = 'overview' | 'users' | 'businesses' | 'delivery';

const PlaceholderContent: React.FC<{ title: string }> = ({ title }) => (
    <div className="p-8">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <Card className="p-8 text-center bg-black/20 border border-white/10">
            <p className="text-gray-400">Funcionalidad para {title.toLowerCase()} en construcción.</p>
            <p className="text-gray-500 text-sm mt-2">Esta sección estará disponible próximamente.</p>
        </Card>
    </div>
);


const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
    const [liveOrders, setLiveOrders] = useState(MOCK_LIVE_ORDERS);
    const [currentView, setCurrentView] = useState<AdminView>('overview');
    
    // Simulate order updates
    useEffect(() => {
        const interval = setInterval(() => {
           setLiveOrders(prev => prev.map(o => {
               if(o.status === OrderStatus.ON_THE_WAY && o.delivery_person) {
                   const newLat = o.delivery_person.location.lat + (o.delivery_location.lat - o.delivery_person.location.lat) * 0.05;
                   // FIX: Correctly access the lng property from the delivery_person's location object.
                   const newLng = o.delivery_person.location.lng + (o.delivery_location.lng - o.delivery_person.location.lng) * 0.05;
                   return {...o, delivery_person: {...o.delivery_person, location: {lat: newLat, lng: newLng}}};
               }
               return o;
           }))
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const navItems = [
        { id: 'overview', label: 'Vista General', icon: Activity },
        { id: 'users', label: 'Usuarios', icon: Users },
        { id: 'businesses', label: 'Negocios', icon: Briefcase },
        { id: 'delivery', label: 'Repartidores', icon: Bike }
    ];

    const renderContent = () => {
        switch (currentView) {
            case 'users':
                return <PlaceholderContent title="Gestión de Usuarios" />;
            case 'businesses':
                return <PlaceholderContent title="Gestión de Negocios" />;
            case 'delivery':
                return <PlaceholderContent title="Gestión de Repartidores" />;
            case 'overview':
            default:
                return (
                    <>
                        <header className="p-4 flex-shrink-0">
                             <h2 className="text-3xl font-bold">Vista Global en Tiempo Real</h2>
                        </header>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
                            <StatsCard title="Pedidos Activos" value={liveOrders.length.toString()} icon={<Activity className="text-white" />} iconBgColor="#2F80ED" className="bg-black/20" />
                            <StatsCard title="Clientes en Línea" value="1,204" icon={<Users className="text-white" />} iconBgColor="#27AE60" className="bg-black/20" />
                            <StatsCard title="Negocios Abiertos" value="23" icon={<Briefcase className="text-white" />} iconBgColor="#F2994A" className="bg-black/20" />
                            <StatsCard title="Repartidores Activos" value="47" icon={<Bike className="text-white" />} iconBgColor="#9B51E0" className="bg-black/20" />
                        </div>
                        <div className="flex-grow p-4 min-h-0">
                            <Card className="w-full h-full overflow-hidden bg-transparent p-0">
                                <MapContainer center={[MOCK_USER_LOCATION.lat, MOCK_USER_LOCATION.lng]} zoom={12} scrollWheelZoom={true} className="w-full h-full">
                                   <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' />
                                    {liveOrders.map(order => (
                                        <React.Fragment key={order.id}>
                                            {order.business && <Marker position={[order.business.location.lat, order.business.location.lng]} icon={new L.Icon({iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', shadowSize: [41, 41]})}>
                                                <Popup>{order.business.name}</Popup>
                                            </Marker>}
                                            {order.delivery_person && <Marker position={[order.delivery_person.location.lat, order.delivery_person.location.lng]} icon={new L.Icon({iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', shadowSize: [41, 41]})}>
                                                <Popup>{order.delivery_person.name}</Popup>
                                            </Marker>}
                                            <Marker position={[order.delivery_location.lat, order.delivery_location.lng]} icon={new L.Icon({iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', shadowSize: [41, 41]})}>
                                                <Popup>Cliente #{order.client_id.slice(-4)}</Popup>
                                            </Marker>}
                                        </React.Fragment>
                                    ))}
                                </MapContainer>
                            </Card>
                        </div>
                    </>
                );
        }
    }
    
    return (
        <div className="flex h-screen bg-[#081826] text-white">
            <aside className="w-64 bg-[#0B2235] shadow-lg p-4 flex flex-col flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-400 mb-8">{APP_NAME} Admin</h1>
                <nav className="flex-grow">
                    <ul>
                       {navItems.map(item => (
                            <li key={item.id} className="mb-2">
                                <button
                                    onClick={() => setCurrentView(item.id as AdminView)}
                                    className={`w-full flex items-center p-3 rounded-lg text-left transition-colors duration-200 ${
                                        currentView === item.id
                                            ? 'bg-blue-500/20 text-blue-300 font-semibold'
                                            : 'hover:bg-white/10'
                                    }`}
                                >
                                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div>
                     <p className="text-sm text-gray-400">Hola, {user.name}</p>
                     <Button onClick={onLogout} variant="secondary" className="w-full mt-2">Cerrar Sesión</Button>
                </div>
            </aside>
            <main className="flex-1 flex flex-col overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;