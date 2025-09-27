
import React, { useState, useEffect } from 'react';
import { Profile, Order, OrderStatus, UserRole } from '../types';
import { APP_NAME, ORDER_STATUS_MAP } from '../constants';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Clock, Check, X, UtensilsCrossed } from 'lucide-react';
import DashboardHeader from '../components/shared/DashboardHeader';
import { notificationService } from '../services/notificationService';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Icon definitions for the map markers
const iconBusiness = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', shadowSize: [41, 41]
});
const iconPerson = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', shadowSize: [41, 41]
});
const iconDelivery = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', shadowSize: [41, 41]
});


interface BusinessDashboardProps {
  user: Profile;
  onLogout: () => void;
}

const MOCK_INCOMING_ORDERS: Order[] = [
    {
        id: 'order-124', client_id: 'client-2', business_id: 'business-1', 
        items: [
            { product: { id: 'p2', name: 'Gringa de Pastor', price: 45, business_id: 'business-1', category: 'Main', description: '', image: '' }, quantity: 2 },
            { product: { id: 'p3', name: 'Agua de Horchata', price: 20, business_id: 'business-1', category: 'Drinks', description: '', image: '' }, quantity: 1 },
        ],
        total_price: 110, status: OrderStatus.PENDING, 
        delivery_address: 'Otra Calle 456', delivery_location: { lat: 19.4400, lng: -99.1250 },
        created_at: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
        special_notes: "Sin cebolla por favor.",
        client: { id: 'client-2', name: 'Carlos C.', email: '', role: UserRole.CLIENT }
    },
    {
        id: 'order-123', client_id: 'client-1', business_id: 'business-1', delivery_person_id: 'delivery-1',
        items: [{ product: { id: 'p1', name: 'Tacos al Pastor (3)', price: 60, business_id: 'business-1', category: 'Main', description: '', image: '' }, quantity: 2 }],
        total_price: 120, status: OrderStatus.IN_PREPARATION, 
        delivery_address: 'Mi Casa 123', delivery_location: { lat: 19.4350, lng: -99.1350 },
        created_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        preparation_time: 15,
        client: { id: 'client-1', name: 'Ana A.', email: '', role: UserRole.CLIENT },
        delivery_person: { id: 'delivery-1', name: 'Pedro R.', location: { lat: 19.4315, lng: -99.1315 }, is_online: true, vehicle: '', current_deliveries: 0, email: '', phone: '', rating: 0 }
    }
];

const OrderCard: React.FC<{ order: Order, onUpdateStatus: (id: string, status: OrderStatus, prepTime?: number) => void }> = ({ order, onUpdateStatus }) => {
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        if(order.status === OrderStatus.PENDING) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        onUpdateStatus(order.id, OrderStatus.REJECTED);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order.status, order.id]);
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const statusInfo = ORDER_STATUS_MAP[order.status];

    return (
        <Card className="p-4 mb-4">
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-lg">Pedido #{order.id.slice(-6)}</h4>
                <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${statusInfo.color}`}>{statusInfo.text}</div>
            </div>
             <p className="text-sm text-gray-500 dark:text-gray-400">De: {order.client?.name || 'Cliente'}</p>
            <div className="my-3 border-t border-gray-200 dark:border-gray-700"></div>
            <ul>
                {order.items.map(item => (
                    <li key={item.product.id} className="flex justify-between">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                    </li>
                ))}
            </ul>
             {order.special_notes && <p className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-sm"><b>Notas:</b> {order.special_notes}</p>}
            <div className="my-3 border-t border-gray-200 dark:border-gray-700"></div>
            <div className="flex justify-end font-bold text-lg">Total: ${order.total_price.toFixed(2)}</div>
            
            {order.status === OrderStatus.PENDING && (
                <div className="mt-4">
                    <div className="text-center text-red-500 font-bold mb-2">
                        <Clock className="inline-block mr-2" /> Tiempo para aceptar: {minutes}:{seconds < 10 ? '0' : ''}{seconds}
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => onUpdateStatus(order.id, OrderStatus.REJECTED)} variant="danger" className="w-full"><X className="inline-block mr-1" /> Rechazar</Button>
                        <Button onClick={() => onUpdateStatus(order.id, OrderStatus.ACCEPTED, 15)} className="w-full"><Check className="inline-block mr-1"/> Aceptar (15 min)</Button>
                    </div>
                </div>
            )}
            {order.status === OrderStatus.IN_PREPARATION && (
                <Button onClick={() => onUpdateStatus(order.id, OrderStatus.READY_FOR_PICKUP)} className="w-full mt-4">Marcar como Listo para Recoger</Button>
            )}
        </Card>
    );
};


const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ user, onLogout }) => {
    const [orders, setOrders] = useState<Order[]>(MOCK_INCOMING_ORDERS);
    
    const handleUpdateStatus = (id: string, status: OrderStatus, prepTime?: number) => {
        const order = orders.find(o => o.id === id);
        if(!order) return;

        setOrders(prevOrders => prevOrders.map(o => 
            o.id === id ? { ...o, status: status, preparation_time: prepTime || o.preparation_time, delivery_person_id: status === OrderStatus.ACCEPTED ? "delivery-pending" : o.delivery_person_id} : o
        ));

        if (status === OrderStatus.ACCEPTED) {
            notificationService.sendNotification({
                id: `note-${Date.now()}`,
                role: UserRole.CLIENT,
                orderId: id,
                title: 'Pedido Confirmado',
                message: `¡${user.name} ha aceptado tu pedido y lo está preparando!`,
                type: 'success',
                icon: Check,
            });
        }
        
        if (status === OrderStatus.READY_FOR_PICKUP) {
             notificationService.sendNotification({
                id: `note-${Date.now()}`,
                role: UserRole.DELIVERY,
                orderId: id,
                title: 'Pedido Listo para Recoger',
                message: `El pedido #${id.slice(-6)} de ${user.name} está listo.`,
                type: 'info',
                icon: UtensilsCrossed,
            });
        }
    };

    const newOrders = orders.filter(o => o.status === OrderStatus.PENDING);
    const activeOrders = orders.filter(o => o.status !== OrderStatus.PENDING && o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.REJECTED);

    return (
        <div>
            <DashboardHeader userName={user.name} onLogout={onLogout} title={user.name} />
            <main className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <h2 className="text-3xl font-bold mb-4">Nuevos Pedidos ({newOrders.length})</h2>
                     <div className="max-h-[40vh] overflow-y-auto pr-2">
                        {newOrders.length > 0 ? newOrders.map(order => (
                            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
                        )) : <p>No hay pedidos nuevos por el momento.</p>}
                    </div>
                    <h2 className="text-3xl font-bold my-4">Pedidos Activos ({activeOrders.length})</h2>
                     <div className="max-h-[calc(50vh-100px)] overflow-y-auto pr-2">
                         {activeOrders.length > 0 ? activeOrders.map(order => (
                            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
                        )) : <p>No hay pedidos activos.</p>}
                    </div>
                </div>
                 <div className="lg:col-span-2">
                    <h2 className="text-3xl font-bold mb-4">Mapa de Pedidos Activos</h2>
                    <Card className="h-[calc(100vh-200px)] overflow-hidden">
                        {user.location && (
                            <MapContainer center={[user.location.lat, user.location.lng]} zoom={13} scrollWheelZoom={true} className="h-full w-full">
                               <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                               <Marker position={[user.location.lat, user.location.lng]} icon={iconBusiness}>
                                  <Popup>{user.name}</Popup>
                               </Marker>
                               {activeOrders.map(order => (
                                   <React.Fragment key={order.id}>
                                        <Marker position={[order.delivery_location.lat, order.delivery_location.lng]} icon={iconPerson}>
                                            <Popup>Cliente: {order.client?.name || 'Cliente'}</Popup>
                                        </Marker>
                                        {order.delivery_person?.location && (
                                             <Marker position={[order.delivery_person.location.lat, order.delivery_person.location.lng]} icon={iconDelivery}>
                                                <Popup>Repartidor: {order.delivery_person.name}</Popup>
                                            </Marker>
                                        )}
                                        {order.delivery_person?.location && user.location && (
                                            <Polyline positions={[[user.location.lat, user.location.lng], [order.delivery_person.location.lat, order.delivery_person.location.lng]]} color="orange" dashArray="5, 10" />
                                        )}
                                        {order.delivery_person?.location && (
                                            <Polyline positions={[[order.delivery_person.location.lat, order.delivery_person.location.lng], [order.delivery_location.lat, order.delivery_location.lng]]} color="blue" />
                                        )}
                                   </React.Fragment>
                               ))}
                            </MapContainer>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default BusinessDashboard;
