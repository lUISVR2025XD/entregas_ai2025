
import React from 'react';
import { Order, OrderStatus } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ORDER_STATUS_MAP } from '../constants';
import { ChevronLeft, Package, Calendar, Tag } from 'lucide-react';

interface OrderHistoryPageProps {
    orders: Order[];
    onTrackOrder: (order: Order) => void;
    onBackToShopping: () => void;
}

const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ orders, onTrackOrder, onBackToShopping }) => {
    
    const isTrackable = (status: OrderStatus) => {
        return [
            OrderStatus.ACCEPTED,
            OrderStatus.IN_PREPARATION,
            OrderStatus.READY_FOR_PICKUP,
            OrderStatus.ON_THE_WAY
        ].includes(status);
    };

    return (
        <div className="container mx-auto p-4 md:p-8 animate-fade-in">
             <Button onClick={onBackToShopping} variant="secondary" className="mb-6 flex items-center">
                <ChevronLeft className="w-5 h-5 mr-2" />
                Volver a Restaurantes
            </Button>
            
            <h2 className="text-3xl font-bold mb-6 text-gray-700 dark:text-gray-200">Historial de Pedidos</h2>

            {orders.length > 0 ? (
                <div className="space-y-6">
                    {orders.map(order => {
                        const statusInfo = ORDER_STATUS_MAP[order.status];
                        return (
                            <Card key={order.id} className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex-grow">
                                    <div className="flex items-center mb-2">
                                        <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${statusInfo.color}`}>{statusInfo.text}</span>
                                        <h3 className="text-xl font-bold ml-4">{order.business?.name}</h3>
                                    </div>
                                    <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-x-4 gap-y-1">
                                       <span className="flex items-center"><Package className="w-4 h-4 mr-1.5"/>ID: #{order.id.slice(-6)}</span>
                                       <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5"/>{new Date(order.created_at).toLocaleDateString()}</span>
                                       <span className="flex items-center"><Tag className="w-4 h-4 mr-1.5"/>${order.total_price.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 w-full md:w-auto">
                                    {isTrackable(order.status) ? (
                                        <Button onClick={() => onTrackOrder(order)} className="w-full">
                                            Seguir Pedido
                                        </Button>
                                    ) : (
                                         <Button variant="secondary" className="w-full" disabled>
                                            Ver Detalles
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-10">No has realizado ningún pedido todavía.</p>
            )}
        </div>
    );
};

export default OrderHistoryPage;
