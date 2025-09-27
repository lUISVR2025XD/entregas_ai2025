
import React, { useState, useEffect } from 'react';
import { Profile, Order, OrderStatus, DeliveryPerson, UserRole } from '../types';
import { APP_NAME, ORDER_STATUS_MAP, QUICK_MESSAGES_DELIVERY } from '../constants';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import OrderTrackingMap from '../components/maps/OrderTrackingMap';
import { ToggleLeft, ToggleRight, MessageSquare, LogOut, Bike } from 'lucide-react';
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


interface DeliveryDashboardProps {
  user: Profile;
  onLogout: () => void;
}

const MOCK_AVAILABLE_ORDERS: Order[] = [
    {
        id: 'order-125', client_id: 'client-3', 
        business_id: 'business-2', 
        items: [{ product: { id: 'p4', name: 'Ramen Tonkotsu', price: 180, business_id: 'business-2', category: 'Main', description: '', image: '' }, quantity: 1 }],
        total_price: 225, status: OrderStatus.READY_FOR_PICKUP,
        delivery_address: 'Avenida Lejana 789', delivery_location: { lat: 19.4250, lng: -99.1450 },
        business: { id: 'business-2', name: 'Sushi Express', location: { lat: 19.4350, lng: -99.1400 }, category: 'Japonesa', delivery_fee: 45, delivery_time: '30-40min', image:'', is_open: true, phone: '', address: '', email: '', rating: 4.6 },
        created_at: new Date(Date.now() - 600000).toISOString(),
    }
];

const DeliveryHeader: React.FC<{ user: Profile, onLogout: () => void, isOnline: boolean, setIsOnline: (isOnline: boolean) => void }> = ({ user, onLogout, isOnline, setIsOnline }) => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-orange-500">{APP_NAME}</h1>
            <div className="flex items-center">
                <span className="mr-4">Hola, {user.name}</span>
                <button onClick={() => setIsOnline(!isOnline)} className="flex items-center font-semibold text-lg mr-4">
                    {isOnline ? <ToggleRight className="h-10 w-10 text-green-500" /> : <ToggleLeft className="h-10 w-10 text-gray-500" />}
                    <span className={isOnline ? 'text-green-500' : 'text-gray-500'}>{isOnline ? 'En Línea' : 'Desconectado'}</span>
                </button>
                <Button onClick={onLogout} variant="secondary" className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                </Button>
            </div>
        </header>
    );
}

const DeliveryDashboard: React.FC<DeliveryDashboardProps> = ({ user, onLogout }) => {
    const [isOnline, setIsOnline] = useState(false);
    const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson>({
         id: user.id, name: user.name, is_online: false, location: { lat: 19.4280, lng: -99.1380 }, vehicle: 'Moto', rating: 4.9, current_deliveries: 0, email: '', phone: ''
    });

    useEffect(() => {
        if(isOnline) {
            setAvailableOrders(MOCK_AVAILABLE_ORDERS);
        } else {
            setAvailableOrders([]);
        }
    }, [isOnline]);

    const handleAcceptOrder = (order: Order) => {
        const acceptedOrder = {...order, status: OrderStatus.ON_THE_WAY, delivery_person_id: user.id };
        setCurrentOrder(acceptedOrder);
        setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
        
        notificationService.sendNotification({
            id: `note-${Date.now()}`,
            role: UserRole.CLIENT,
            orderId: order.id,
            title: '¡Tu pedido está en camino!',
            message: `${user.name} ha recogido tu pedido de ${order.business?.name}.`,
            type: 'info',
            icon: Bike,
        });
    };

    const handleUpdateStatus = (status: OrderStatus) => {
        if(currentOrder) {
            if(status === OrderStatus.DELIVERED) {
                alert("Pedido entregado! Esperando calificación del cliente.");
                setCurrentOrder(null);
            } else {
                setCurrentOrder({...currentOrder, status});
            }
        }
    }
    
    const sendQuickMessage = (message: string) => {
        alert(`Mensaje enviado al cliente: "${message}"`);
    }

    const renderCurrentOrder = () => {
        if(!currentOrder) return null;
        const statusInfo = ORDER_STATUS_MAP[currentOrder.status];
        return (
            <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold mb-4">Entrega Actual</h2>
                <Card>
                    <OrderTrackingMap 
                        center={deliveryPerson.location}
                        businessLocation={currentOrder.business?.location}
                        deliveryLocation={deliveryPerson.location}
                        clientLocation={currentOrder.delivery_location}
                        className="h-96 w-full"
                    />
                    <div className="p-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-lg">Pedido #{currentOrder.id.slice(-6)}</h4>
                            <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${statusInfo.color}`}>{statusInfo.text}</div>
                        </div>
                        <p><b>Recoger en:</b> {currentOrder.business?.name}</p>
                        <p><b>Entregar en:</b> {currentOrder.delivery_address}</p>
                        
                        <div className="my-3 border-t border-gray-200 dark:border-gray-700"></div>

                         <div className="mb-4">
                             <h5 className="font-semibold mb-2">Mensajes Rápidos</h5>
                             <div className="grid grid-cols-2 gap-2">
                                 {QUICK_MESSAGES_DELIVERY.map(msg => (
                                     <Button key={msg} variant="secondary" onClick={() => sendQuickMessage(msg)} className="text-sm">
                                         <MessageSquare className="inline-block mr-1 h-4 w-4"/> {msg}
                                     </Button>
                                 ))}
                             </div>
                         </div>

                        {currentOrder.status === OrderStatus.ON_THE_WAY && (
                            <Button onClick={() => handleUpdateStatus(OrderStatus.DELIVERED)} className="w-full mt-2">Marcar como Entregado</Button>
                        )}
                    </div>
                </Card>
            </div>
        )
    }

    const renderAvailableOrders = () => (
        <div className="lg:col-span-1">
            <h2 className="text-3xl font-bold mb-4">Pedidos Disponibles</h2>
            {!isOnline ? (
                <p>Ponte en línea para ver pedidos.</p>
            ) : availableOrders.length > 0 ? (
                availableOrders.map(order => (
                    <Card key={order.id} className="p-4 mb-4">
                        <h4 className="font-bold">Recoger en {order.business?.name}</h4>
                        <p className="text-sm">Entregar en: {order.delivery_address}</p>
                        <p className="font-bold text-lg mt-2">Ganancia: ${(order.total_price * 0.15 + 20).toFixed(2)}</p>
                        <Button onClick={() => handleAcceptOrder(order)} className="w-full mt-4">Aceptar Pedido</Button>
                    </Card>
                ))
            ) : (
                <p>No hay pedidos disponibles cerca de ti.</p>
            )}
        </div>
    )

    return (
        <div>
            <DeliveryHeader user={user} onLogout={onLogout} isOnline={isOnline} setIsOnline={setIsOnline} />
            <main className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {currentOrder ? (
                     <>
                        {renderCurrentOrder()}
                        <div className="hidden lg:block">{renderAvailableOrders()}</div>
                    </>
                ) : (
                    <>
                        {renderAvailableOrders()}
                        <div className="lg:col-span-2">
                            <h2 className="text-3xl font-bold mb-4">Mapa de Pedidos Disponibles</h2>
                            <Card className="h-[calc(100vh-200px)] overflow-hidden">
                                <MapContainer center={[deliveryPerson.location.lat, deliveryPerson.location.lng]} zoom={13} scrollWheelZoom={true} className="h-full w-full">
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                                    <Marker position={[deliveryPerson.location.lat, deliveryPerson.location.lng]} icon={iconDelivery}>
                                        <Popup>Tu ubicación</Popup>
                                    </Marker>
                                    {availableOrders.map(order => (
                                        <React.Fragment key={order.id}>
                                            {order.business?.location && (
                                                <Marker position={[order.business.location.lat, order.business.location.lng]} icon={iconBusiness}>
                                                    <Popup>Recoger: {order.business.name}</Popup>
                                                </Marker>
                                            )}
                                            <Marker position={[order.delivery_location.lat, order.delivery_location.lng]} icon={iconPerson}>
                                                <Popup>Entregar a cliente</Popup>
                                            </Marker>
                                            {order.business?.location && (
                                                <Polyline positions={[[order.business.location.lat, order.business.location.lng], [order.delivery_location.lat, order.delivery_location.lng]]} color="gray" dashArray="5, 5" />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </MapContainer>
                            </Card>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default DeliveryDashboard;
