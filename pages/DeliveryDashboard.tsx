
import React, { useState, useEffect } from 'react';
import { Profile, Order, OrderStatus, DeliveryPerson, UserRole, Notification } from '../types';
import { ORDER_STATUS_MAP, QUICK_MESSAGES_DELIVERY } from '../constants';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import OrderTrackingMap from '../components/maps/OrderTrackingMap';
import { MessageSquare, Bike, DollarSign, Clock, BarChart, Power, Menu, PackageCheck } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import StatsCard from '../components/ui/StatsCard';


interface DeliveryDashboardProps {
  user: Profile;
  onLogout: () => void;
}

const MOCK_AVAILABLE_ORDERS: Order[] = [];


const DeliveryDashboard: React.FC<DeliveryDashboardProps> = ({ user, onLogout }) => {
    const [isOnline, setIsOnline] = useState(false);
    const [availableOrders, setAvailableOrders] = useState<Order[]>(MOCK_AVAILABLE_ORDERS);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson>({
         id: user.id, name: user.name, is_online: false, location: { lat: 19.4280, lng: -99.1380 }, vehicle: 'Moto', rating: 4.9, current_deliveries: 0, email: '', phone: ''
    });

    useEffect(() => {
        if (!isOnline) {
            setAvailableOrders([]);
            return;
        }
    
        const handleNotification = (notification: Notification) => {
          if (notification.role === UserRole.DELIVERY && notification.order && notification.title === 'Pedido Listo para Recoger') {
            setAvailableOrders(prev => {
                if (prev.find(o => o.id === notification.order!.id)) return prev;
                return [notification.order, ...prev];
            });
          }
        };
    
        const unsubscribe = notificationService.subscribe(handleNotification);
        return () => unsubscribe();
    }, [isOnline]);

    const handleAcceptOrder = (order: Order) => {
        const acceptedOrder = {...order, status: OrderStatus.ON_THE_WAY, delivery_person_id: user.id };
        setCurrentOrder(acceptedOrder);
        setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
        
        notificationService.sendNotification({
            id: `note-onway-${Date.now()}`,
            role: UserRole.CLIENT,
            orderId: order.id,
            title: '¡Tu pedido está en camino!',
            message: `${user.name} ha recogido tu pedido de ${order.business?.name}.`,
            type: 'info',
            icon: Bike,
        });

        notificationService.sendNotification({
            id: `note-pickedup-biz-${Date.now()}`,
            role: UserRole.BUSINESS,
            orderId: order.id,
            title: 'Pedido Recogido',
            message: `El repartidor ${user.name} ha recogido el pedido #${order.id.slice(-6)}.`,
            type: 'info',
            icon: Bike
        });
    };

    const handleUpdateStatus = (status: OrderStatus) => {
        if(currentOrder) {
            if(status === OrderStatus.DELIVERED) {
                notificationService.sendNotification({
                    id: `note-delivered-${Date.now()}`,
                    role: UserRole.CLIENT,
                    orderId: currentOrder.id,
                    title: '¡Pedido Entregado!',
                    message: `Tu pedido de ${currentOrder.business?.name} ha sido entregado por ${user.name}. ¡Buen provecho!`,
                    type: 'success',
                    icon: PackageCheck
                });

                notificationService.sendNotification({
                    id: `note-delivered-biz-${Date.now()}`,
                    role: UserRole.BUSINESS,
                    orderId: currentOrder.id,
                    title: '¡Pedido Entregado!',
                    message: `El pedido #${currentOrder.id.slice(-6)} ha sido entregado.`,
                    type: 'success',
                    icon: PackageCheck
                });

                setCurrentOrder(null);
            } else {
                setCurrentOrder({...currentOrder, status});
            }
        }
    }
    
    const sendQuickMessage = (message: string) => {
        if (!currentOrder) return;
        notificationService.sendNotification({
            id: `note-msg-delivery-${Date.now()}`,
            role: UserRole.CLIENT,
            orderId: currentOrder.id,
            title: 'Mensaje del Repartidor',
            message: `${user.name}: "${message}"`,
            type: 'info',
            icon: MessageSquare
        });
        alert(`Mensaje enviado al cliente.`);
    }

    const renderCurrentOrder = () => {
        if(!currentOrder) return null;
        const statusInfo = ORDER_STATUS_MAP[currentOrder.status];
        return (
            <div className="lg:col-span-2 mt-6">
                <h2 className="text-3xl font-bold mb-4">Entrega Actual</h2>
                <Card className="bg-transparent p-0">
                    <OrderTrackingMap 
                        center={deliveryPerson.location}
                        businessLocation={currentOrder.business?.location}
                        deliveryLocation={deliveryPerson.location}
                        clientLocation={currentOrder.delivery_location}
                        className="h-96 w-full rounded-t-2xl"
                    />
                    <div className="p-4 bg-gradient-to-br from-[#5A0000] to-[#400000] rounded-b-2xl">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-lg">Pedido #{currentOrder.id.slice(-6)}</h4>
                            <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${statusInfo.color}`}>{statusInfo.text}</div>
                        </div>
                        <p><b>Recoger en:</b> {currentOrder.business?.name}</p>
                        <p><b>Entregar en:</b> {currentOrder.delivery_address}</p>
                        
                        <div className="my-3 border-t border-white/20"></div>

                         <div className="mb-4">
                             <h5 className="font-semibold mb-2">Mensajes Rápidos al Cliente</h5>
                             <div className="grid grid-cols-2 gap-2">
                                 {QUICK_MESSAGES_DELIVERY.map(msg => (
                                     <Button key={msg} variant="secondary" onClick={() => sendQuickMessage(msg)} className="text-sm">
                                         <MessageSquare className="inline-block mr-1 h-4 w-4"/> {msg}
                                     </Button>
                                 ))}
                             </div>
                         </div>

                        {currentOrder.status === OrderStatus.ON_THE_WAY && (
                            <Button onClick={() => handleUpdateStatus(OrderStatus.DELIVERED)} className="w-full mt-2 bg-green-600 hover:bg-green-700">Marcar como Entregado</Button>
                        )}
                    </div>
                </Card>
            </div>
        )
    }

    const renderAvailableOrders = () => (
        <div className="lg:col-span-1 mt-6">
            <h2 className="text-3xl font-bold mb-4">Pedidos Disponibles</h2>
            {!isOnline ? (
                <p className="bg-black/20 p-4 rounded-lg text-center">Ponte en línea para ver pedidos.</p>
            ) : availableOrders.length > 0 ? (
                availableOrders.map(order => (
                    <Card key={order.id} className="p-4 mb-4 bg-gradient-to-br from-[#5A0000] to-[#400000]">
                        <h4 className="font-bold">Recoger en {order.business?.name}</h4>
                        <p className="text-sm">Entregar en: {order.delivery_address}</p>
                        <p className="font-bold text-lg mt-2">Ganancia: ${(order.total_price * 0.15 + 20).toFixed(2)}</p>
                        <Button onClick={() => handleAcceptOrder(order)} className="w-full mt-4 bg-green-600 hover:bg-green-700">Aceptar Pedido</Button>
                    </Card>
                ))
            ) : (
                 <p className="bg-black/20 p-4 rounded-lg text-center">No hay pedidos disponibles cerca de ti.</p>
            )}
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#3D0000] to-[#2A0000] text-white">
            <header className="p-4 md:px-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-wider">vrtelolleva Driver</h1>
                <button onClick={onLogout} className="p-2">
                    <Menu size={28} />
                </button>
            </header>
            <main className="p-4 md:p-8">
                 <div className="bg-black/20 p-4 rounded-lg flex justify-between items-center mb-6">
                    <div className="flex items-center">
                         <Power className={`mr-3 ${isOnline ? 'text-green-400 animate-pulse' : 'text-gray-500'}`} />
                         <span className="font-semibold text-lg">Estado: {isOnline ? 'En línea' : 'Desconectado'}</span>
                    </div>
                    <Button onClick={() => setIsOnline(!isOnline)} variant={isOnline ? 'danger' : 'secondary'} className={!isOnline ? `bg-green-600 hover:bg-green-700` : ''}>
                        {isOnline ? 'Desconectarse' : 'Conectarse'}
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatsCard 
                        title="Ganancias Hoy" 
                        value="$0.00" 
                        subtitle="0 entregas" 
                        icon={<DollarSign size={28} className="text-white"/>} 
                        iconBgColor="#27AE60" 
                        className="bg-gradient-to-br from-[#5A0000] to-[#400000]" 
                    />
                    <StatsCard 
                        title="Entregas Activas" 
                        value={currentOrder ? "1" : "0"} 
                        subtitle="En proceso" 
                        icon={<Bike size={28} className="text-white"/>} 
                        iconBgColor="#2F80ED" 
                        className="bg-gradient-to-br from-[#5A0000] to-[#400000]" 
                    />
                    <StatsCard 
                        title="Pedidos Disponibles" 
                        value={availableOrders.length.toString()}
                        subtitle="Listos para recoger" 
                        icon={<Clock size={28} className="text-white"/>} 
                        iconBgColor="#F2994A" 
                        className="bg-gradient-to-br from-[#5A0000] to-[#400000]" 
                    />
                    <StatsCard 
                        title="Total Entregas" 
                        value="45" 
                        subtitle="Historial completo" 
                        icon={<BarChart size={28} className="text-white"/>} 
                        iconBgColor="#9B51E0" 
                        className="bg-gradient-to-br from-[#5A0000] to-[#400000]" 
                    />
                </div>

                 {currentOrder ? renderCurrentOrder() : renderAvailableOrders()}

            </main>
        </div>
    );
};

export default DeliveryDashboard;
