
import React, { useState, useEffect } from 'react';
// FIX: Added imports for react-leaflet and leaflet to render the map, and removed unused OrderTrackingMap import.
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Profile, Order, OrderStatus, Location } from '../types';
import { APP_NAME, MOCK_USER_LOCATION } from '../constants';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
// FIX: The 'Moped' icon does not exist in lucide-react, replaced with 'Bike'.
import { Users, Bike, Briefcase, Activity } from 'lucide-react';

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


const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
    const [liveOrders, setLiveOrders] = useState(MOCK_LIVE_ORDERS);
    
    // Simulate order updates
    useEffect(() => {
        const interval = setInterval(() => {
           setLiveOrders(prev => prev.map(o => {
               if(o.status === OrderStatus.ON_THE_WAY && o.delivery_person) {
                   const newLat = o.delivery_person.location.lat + (o.delivery_location.lat - o.delivery_person.location.lat) * 0.05;
                   const newLng = o.delivery_person.location.lng + (o.delivery_location.lng - o.delivery_person.location.lng) * 0.05;
                   return {...o, delivery_person: {...o.delivery_person, location: {lat: newLat, lng: newLng}}};
               }
               return o;
           }))
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const StatsCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
        <Card className="p-4 flex items-center">
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900 mr-4">
                <Icon className="h-6 w-6 text-orange-500" />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </Card>
    );
    
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg p-4 flex flex-col">
                <h1 className="text-2xl font-bold text-orange-500 mb-8">{APP_NAME} Admin</h1>
                <nav className="flex-grow">
                    <ul>
                        <li className="mb-2"><a href="#" className="flex items-center p-2 rounded-lg bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 font-semibold"><Activity className="mr-3"/> Vista General</a></li>
                        <li className="mb-2"><a href="#" className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><Users className="mr-3"/> Usuarios</a></li>
                        <li className="mb-2"><a href="#" className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><Briefcase className="mr-3"/> Negocios</a></li>
                        {/* FIX: The 'Moped' icon does not exist in lucide-react, replaced with 'Bike'. */}
                        <li className="mb-2"><a href="#" className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><Bike className="mr-3"/> Repartidores</a></li>
                    </ul>
                </nav>
                <div>
                     <p className="text-sm">Hola, {user.name}</p>
                     <Button onClick={onLogout} variant="secondary" className="w-full mt-2">Cerrar Sesión</Button>
                </div>
            </aside>
            <main className="flex-1 flex flex-col">
                <header className="p-4">
                     <h2 className="text-3xl font-bold">Vista Global en Tiempo Real</h2>
                </header>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard title="Pedidos Activos" value={liveOrders.length.toString()} icon={Activity}/>
                    <StatsCard title="Clientes en Línea" value="1,204" icon={Users}/>
                    <StatsCard title="Negocios Abiertos" value="23" icon={Briefcase}/>
                    {/* FIX: The 'Moped' icon does not exist in lucide-react, replaced with 'Bike'. */}
                    <StatsCard title="Repartidores Activos" value="47" icon={Bike}/>
                </div>
                <div className="flex-grow p-4">
                    <Card className="w-full h-full overflow-hidden">
                        <MapContainer center={[MOCK_USER_LOCATION.lat, MOCK_USER_LOCATION.lng]} zoom={12} scrollWheelZoom={true} className="w-full h-full">
                           <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
            </main>
        </div>
    );
};

export default AdminDashboard;
