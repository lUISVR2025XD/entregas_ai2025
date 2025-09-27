import React, { useState, useEffect } from 'react';
import { Profile, Order, OrderStatus, CartItem, Business, Location, Product, UserRole, FilterState } from '../types';
import OrderTrackingMap from '../components/maps/OrderTrackingMap';
import { APP_NAME, ORDER_STATUS_MAP, MOCK_USER_LOCATION, QUICK_MESSAGES_CLIENT } from '../constants';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import StarRating from '../components/ui/StarRating';
import { MapPin, Bike, Clock, CheckCircle, Search, Frown, ShoppingBag, Check, ClipboardList, MessageSquare } from 'lucide-react';
import DashboardHeader from '../components/shared/DashboardHeader';
import ShoppingCart from '../components/client/ShoppingCart';
import BusinessCard from '../components/client/BusinessCard';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { notificationService } from '../services/notificationService';
import BusinessDetailPage from './BusinessDetailPage';
import BusinessFilters from '../components/client/BusinessFilters';
import OrderHistoryPage from './OrderHistoryPage';

// Mock API call from HomePage
const fetchNearbyBusinesses = async (location: Location): Promise<Business[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 'b1', name: 'Taquería El Pastor', category: 'Mexicana', rating: 4.8, delivery_time: '25-35 min', delivery_fee: 30, image: 'https://picsum.photos/seed/tacos/400/300', location: { lat: 19.4300, lng: -99.1300 }, is_open: true, phone: '55-1234-5678', address: 'Calle Falsa 123, Colonia Centro, CDMX', email: 'contacto@elpastor.com', products: MOCK_POPULAR_PRODUCTS.filter(p=>p.business_id === 'b1') },
          { id: 'b2', name: 'Sushi Express', category: 'Japonesa', rating: 4.6, delivery_time: '30-40 min', delivery_fee: 0, image: 'https://picsum.photos/seed/sushi/400/300', location: { lat: 19.4350, lng: -99.1400 }, is_open: true, phone: '55-8765-4321', address: 'Avenida Siempre Viva 742, Roma Norte, CDMX', email: 'hola@sushiexpress.com', products: MOCK_POPULAR_PRODUCTS.filter(p=>p.business_id === 'b2') },
          { id: 'b3', name: 'Pizza Bella', category: 'Italiana', rating: 4.9, delivery_time: '20-30 min', delivery_fee: 25, image: 'https://picsum.photos/seed/pizza/400/300', location: { lat: 19.4290, lng: -99.1350 }, is_open: false, phone: '55-5555-5555', address: 'Plaza Central 1, Condesa, CDMX', email: 'info@pizzabella.com', products: MOCK_POPULAR_PRODUCTS.filter(p=>p.business_id === 'b3') },
          { id: 'b4', name: 'Burger Joint', category: 'Americana', rating: 4.5, delivery_time: '35-45 min', delivery_fee: 40, image: 'https://picsum.photos/seed/burger/400/300', location: { lat: 19.4380, lng: -99.1310 }, is_open: true, phone: '55-1122-3344', address: 'Boulevard del Sabor 55, Polanco, CDMX', email: 'burgers@joint.com', products: MOCK_POPULAR_PRODUCTS.filter(p=>p.business_id === 'b4') },
        ]);
      }, 500);
    });
};
const MOCK_POPULAR_PRODUCTS: Product[] = [
    { id: 'p1', name: 'Tacos al Pastor (3)', price: 60, business_id: 'b1', category: 'Main', description: 'Deliciosos tacos con piña y cilantro.', image: 'https://picsum.photos/seed/tacos-prod/400/300' },
    { id: 'p2', name: 'Pizza Pepperoni Grande', price: 180, business_id: 'b3', category: 'Main', description: 'Clásica pizza con pepperoni de alta calidad.', image: 'https://picsum.photos/seed/pizza-prod/400/300' },
    { id: 'p3', name: 'Doble Queso Hamburguesa', price: 150, business_id: 'b4', category: 'Main', description: 'Con doble carne, doble queso y tocino.', image: 'https://picsum.photos/seed/burger-prod/400/300' },
    { id: 'p4', name: 'California Roll', price: 120, business_id: 'b2', category: 'Main', description: 'Rollo de sushi con surimi, aguacate y pepino.', image: 'https://picsum.photos/seed/sushi-prod/400/300' },
];

const MOCK_PAST_ORDERS: Order[] = [
    { id: 'order-past-1', client_id: 'client-1', business_id: 'b2', total_price: 120, status: OrderStatus.DELIVERED, created_at: new Date(Date.now() - 86400000 * 2).toISOString(), items:[], delivery_location: {lat: 0, lng: 0}, delivery_address: '', business: { id: 'b2', name: 'Sushi Express', location: { lat: 19.4350, lng: -99.1400 }, category: 'Japonesa', delivery_fee: 0, delivery_time: '30-40 min', image: '', is_open: true, phone: '', address: '', email: '', rating: 4.6 }},
    { id: 'order-past-2', client_id: 'client-1', business_id: 'b4', total_price: 190, status: OrderStatus.DELIVERED, created_at: new Date(Date.now() - 86400000).toISOString(), items:[], delivery_location: {lat: 0, lng: 0}, delivery_address: '', business: { id: 'b4', name: 'Burger Joint', location: { lat: 19.4380, lng: -99.1310 }, category: 'Americana', delivery_fee: 40, delivery_time: '35-45 min', image: '', is_open: true, phone: '', address: '', email: '', rating: 4.5 }},
    { id: 'order-past-3', client_id: 'client-1', business_id: 'b1', total_price: 90, status: OrderStatus.CANCELLED, created_at: new Date(Date.now() - 3600000 * 5).toISOString(), items:[], delivery_location: {lat: 0, lng: 0}, delivery_address: '', business: { id: 'b1', name: 'Taquería El Pastor', location: { lat: 19.4300, lng: -99.1300 }, category: 'Mexicana', delivery_fee: 30, delivery_time: '25-35 min', image: '', is_open: true, phone: '', address: '', email: '', rating: 4.8 }},
];

interface ClientDashboardProps {
  user: Profile;
  onLogout: () => void;
}

type ClientView = 'shopping' | 'businessDetail' | 'tracking' | 'history';

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, onLogout }) => {
    const [currentView, setCurrentView] = useState<ClientView>('shopping');
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [pastOrders, setPastOrders] = useState<Order[]>(MOCK_PAST_ORDERS);
    const [deliveryLocation, setDeliveryLocation] = useState<Location | undefined>(undefined);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [cartBusiness, setCartBusiness] = useState<Business | null>(null);
    const [isCartVisible, setIsCartVisible] = useState(false);
    
    // State for shopping view
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

    // State for clear cart confirmation modal
    const [isClearCartModalVisible, setIsClearCartModalVisible] = useState(false);
    const [productToAdd, setProductToAdd] = useState<Product | null>(null);
    
    const initialFilters: FilterState = {
        categories: [],
        minRating: 0,
        maxDeliveryTime: 0,
        maxDeliveryFee: 0,
    };
    const [filters, setFilters] = useState<FilterState>(initialFilters);


    useEffect(() => {
        setLoading(true);
        fetchNearbyBusinesses(user.location || MOCK_USER_LOCATION).then(data => {
            setBusinesses(data);
            setFilteredBusinesses(data);
            setLoading(false);
        });
    }, [user.location]);
    
     const handleFilterChange = (newFilters: Partial<FilterState>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleClearFilters = () => {
        setFilters(initialFilters);
        setSearchQuery('');
    };

    useEffect(() => {
        let filtered = [...businesses];

        // 1. Filter by Search Query
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(business =>
                business.name.toLowerCase().includes(lowercasedQuery) ||
                business.category.toLowerCase().includes(lowercasedQuery)
            );
        }
        
        // 2. Filter by Categories
        if (filters.categories.length > 0) {
            filtered = filtered.filter(business => filters.categories.includes(business.category));
        }

        // 3. Filter by Rating
        if (filters.minRating > 0) {
            filtered = filtered.filter(business => business.rating >= filters.minRating);
        }

        // 4. Filter by Delivery Time
        if (filters.maxDeliveryTime > 0) {
            filtered = filtered.filter(business => {
                const timeParts = business.delivery_time.match(/\d+/g);
                if (!timeParts) return true;
                const maxTime = parseInt(timeParts[timeParts.length - 1], 10);
                return maxTime <= filters.maxDeliveryTime;
            });
        }

        // 5. Filter by Delivery Fee
        if (filters.maxDeliveryFee > 0) {
            if (filters.maxDeliveryFee === 1) { // Special case for "Gratis"
                filtered = filtered.filter(business => business.delivery_fee === 0);
            } else {
                filtered = filtered.filter(business => business.delivery_fee <= filters.maxDeliveryFee);
            }
        }

        setFilteredBusinesses(filtered);
    }, [searchQuery, filters, businesses]);

    // Simulate delivery person moving
    useEffect(() => {
        if (currentView === 'tracking' && activeOrder && activeOrder.status === OrderStatus.ON_THE_WAY && deliveryLocation) {
            const interval = setInterval(() => {
                setDeliveryLocation(prev => {
                    if(!prev) return prev;
                    // Move the delivery person 20% closer to the client with each tick for a more dynamic feel.
                    const newLat = prev.lat + (activeOrder.delivery_location.lat - prev.lat) * 0.2;
                    const newLng = prev.lng + (activeOrder.delivery_location.lng - prev.lng) * 0.2;
                    
                    // Check if the delivery person has arrived.
                    const dist = Math.sqrt(Math.pow(activeOrder.delivery_location.lat - newLat, 2) + Math.pow(activeOrder.delivery_location.lng - newLng, 2));
                    
                    if(dist < 0.0001) { // Threshold for arrival
                         const finalOrderState = {...activeOrder, status: OrderStatus.DELIVERED};
                         setActiveOrder(finalOrderState);
                         setPastOrders(prev => prev.map(o => o.id === finalOrderState.id ? finalOrderState : o));
                         notificationService.sendNotification({
                            id: `note-${Date.now()}`,
                            role: UserRole.CLIENT,
                            orderId: finalOrderState.id,
                            title: '¡Pedido Entregado!',
                            message: `Tu pedido de ${finalOrderState.business?.name} ha llegado.`,
                            type: 'success',
                            icon: CheckCircle
                         });
                         clearInterval(interval);
                         return activeOrder.delivery_location;
                    }
                    return { lat: newLat, lng: newLng };
                });
            }, 2000); // Update every 2 seconds for a smoother "real-time" experience.
            return () => clearInterval(interval);
        }
    }, [activeOrder, currentView, deliveryLocation]);

    const handleRateOrder = () => {
        alert("¡Gracias por tu calificación!");
        setActiveOrder(null);
        setCurrentView('shopping');
    };

    const handleAddToCart = (product: Product) => {
        const productBusiness = businesses.find(b => b.id === product.business_id);
        if (!productBusiness) return;

        if (cartBusiness && cartBusiness.id !== product.business_id) {
            setProductToAdd(product);
            setIsClearCartModalVisible(true);
            return;
        }

        if (!cartBusiness) {
            setCartBusiness(productBusiness);
        }
        
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product.id === product.id);
            if (existingItem) {
                return prevCart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prevCart, { product, quantity: 1 }];
        });
    };
    
    const handleConfirmClearCart = () => {
        if (!productToAdd) return;
        const productBusiness = businesses.find(b => b.id === productToAdd.business_id);
        if (productBusiness) {
            setCart([{ product: productToAdd, quantity: 1 }]);
            setCartBusiness(productBusiness);
        }
        setIsClearCartModalVisible(false);
        setProductToAdd(null);
    };

    const handleUpdateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            handleRemoveItem(productId);
            return;
        }
        setCart(cart.map(item => item.product.id === productId ? { ...item, quantity: newQuantity } : item));
    };

    const handleRemoveItem = (productId: string) => {
        const newCart = cart.filter(item => item.product.id !== productId);
        setCart(newCart);
        if (newCart.length === 0) {
            setCartBusiness(null);
        }
    };
    
    const handlePlaceOrder = (details: { location: Location; notes: string }) => {
        if (!cartBusiness) return;
        const newOrder: Order = {
            id: `order-${Date.now()}`,
            client_id: user.id,
            business_id: cartBusiness.id,
            business: cartBusiness,
            items: cart,
            total_price: cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0) + cartBusiness.delivery_fee,
            status: OrderStatus.PENDING,
            delivery_address: 'Dirección del mapa',
            delivery_location: details.location,
            special_notes: details.notes,
            created_at: new Date().toISOString(),
            delivery_person: { id: 'delivery-1', name: 'Pedro R.', location: cartBusiness.location, is_online: true, vehicle: 'Moto', current_deliveries: 1, email: '', phone: '', rating: 4.9},
        };
        
        setPastOrders(prev => [newOrder, ...prev]);

        notificationService.sendNotification({
            id: `note-${Date.now()}`,
            role: UserRole.BUSINESS,
            orderId: newOrder.id,
            title: '¡Nuevo Pedido!',
            message: `Has recibido un nuevo pedido de ${user.name}.`,
            type: 'new_order',
            icon: ShoppingBag
        });
        
        setTimeout(() => {
            notificationService.sendNotification({
                id: `note-${Date.now()}-accepted`,
                role: UserRole.CLIENT,
                orderId: newOrder.id,
                title: 'Pedido Aceptado',
                message: `¡${newOrder.business?.name} está preparando tu comida!`,
                type: 'info',
                icon: Check
            });
        }, 3000);

        setTimeout(() => {
            const orderOnTheWay = {...newOrder, status: OrderStatus.ON_THE_WAY };
            setActiveOrder(orderOnTheWay);
            setPastOrders(prev => prev.map(o => o.id === orderOnTheWay.id ? orderOnTheWay : o));
            setDeliveryLocation(newOrder.business?.location);
            setCurrentView('tracking');
            notificationService.sendNotification({
                id: `note-${Date.now()}-onway`,
                role: UserRole.CLIENT,
                orderId: newOrder.id,
                title: '¡Tu pedido está en camino!',
                message: 'Un repartidor ha recogido tu pedido y va en camino.',
                type: 'info',
                icon: Bike
            });
        }, 5000); 
        
        setCart([]);
        setCartBusiness(null);
        setIsCartVisible(false);
    };
    
    const handleSelectBusiness = (business: Business) => {
        setSelectedBusiness(business);
        setCurrentView('businessDetail');
    };

    const handleGoBackToList = () => {
        setSelectedBusiness(null);
        setCurrentView('shopping');
    };

    const handleTrackOrderFromHistory = (order: Order) => {
        setActiveOrder(order);
        setDeliveryLocation(order.delivery_person?.location || order.business?.location);
        setCurrentView('tracking');
    };

    const handleSendQuickMessage = (message: string) => {
        if (!activeOrder) return;

        notificationService.sendNotification({
            id: `note-msg-${Date.now()}`,
            role: UserRole.DELIVERY,
            orderId: activeOrder.id,
            title: 'Mensaje del Cliente',
            message: `Cliente para pedido #${activeOrder.id.slice(-6)}: "${message}"`,
            type: 'info',
            icon: MessageSquare
        });
        
        notificationService.sendNotification({
            id: `note-msg-conf-${Date.now()}`,
            role: UserRole.CLIENT,
            orderId: activeOrder.id,
            title: 'Mensaje Enviado',
            message: `Tu mensaje ha sido enviado al repartidor.`,
            type: 'success',
            icon: Check
        });
    };

    const renderOrderStatus = () => {
        if (!activeOrder) return null;
        const statusInfo = ORDER_STATUS_MAP[activeOrder.status];
        return (
             <Card className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold">Tu pedido de <span className="text-orange-500">{activeOrder.business?.name}</span></h3>
                        <p className="text-gray-500 dark:text-gray-400">ID del Pedido: {activeOrder.id.slice(-6)}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-white font-semibold ${statusInfo.color}`}>{statusInfo.text}</div>
                </div>
                <div className="mt-6 flex items-center space-x-8 text-lg">
                    <div className="flex items-center"><Clock className="w-6 h-6 mr-2 text-orange-500"/><span>Hora estimada: <span className="font-bold">25-30 min</span></span></div>
                    <div className="flex items-center"><Bike className="w-6 h-6 mr-2 text-orange-500"/><span>Repartidor: <span className="font-bold">{activeOrder.delivery_person?.name}</span></span></div>
                </div>
                
                 {activeOrder.status === OrderStatus.DELIVERED && (
                     <div className="mt-8 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 rounded-lg p-6 text-center">
                         <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                         <h4 className="text-2xl font-bold text-green-800 dark:text-green-200">¡Tu pedido ha sido entregado!</h4>
                         <p className="text-gray-600 dark:text-gray-300 mt-2 mb-6">Por favor, califica tu experiencia.</p>
                         <div className="flex flex-col items-center space-y-4">
                            <div><p className="font-semibold mb-1">Calificar a {activeOrder.business?.name}</p><StarRating rating={0} setRating={() => {}} size={28}/></div>
                             <div><p className="font-semibold mb-1">Calificar a {activeOrder.delivery_person?.name}</p><StarRating rating={0} setRating={() => {}} size={28}/></div>
                         </div>
                         <Button onClick={handleRateOrder} className="mt-6 w-full md:w-auto">Enviar Calificación</Button>
                     </div>
                 )}
            </Card>
        );
    };

    const renderContent = () => {
        switch (currentView) {
            case 'tracking':
                return (
                    <main className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
                        <div className="lg:col-span-2">
                            <Card className="overflow-hidden h-full">
                               <OrderTrackingMap 
                                    center={activeOrder?.delivery_location || user.location!}
                                    clientLocation={activeOrder?.delivery_location}
                                    businessLocation={activeOrder?.business?.location}
                                    deliveryLocation={deliveryLocation}
                                    className="h-full min-h-[400px] w-full"
                                    quickMessages={QUICK_MESSAGES_CLIENT}
                                    onSendQuickMessage={handleSendQuickMessage}
                                    isSendingAllowed={activeOrder?.status === OrderStatus.ON_THE_WAY}
                               />
                            </Card>
                        </div>
                        <div className="lg:col-span-1">
                            {renderOrderStatus()}
                        </div>
                    </main>
                );
            case 'businessDetail':
                return selectedBusiness && <BusinessDetailPage business={selectedBusiness} onAddToCart={handleAddToCart} onGoBack={handleGoBackToList} />;
            case 'history':
                return <OrderHistoryPage orders={pastOrders} onTrackOrder={handleTrackOrderFromHistory} onBackToShopping={() => setCurrentView('shopping')} />;
            case 'shopping':
            default:
                 return (
                    <div className="container mx-auto p-4 md:p-8">
                        <div className="relative mb-4 max-w-2xl mx-auto">
                            <input type="text" placeholder="Busca tu restaurante favorito..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full p-4 pl-12 border dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                        </div>
                         <BusinessFilters
                            businesses={businesses}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                        />
                        <main>
                            <h2 className="text-3xl font-bold mb-6 text-gray-700 dark:text-gray-200">Restaurantes</h2>
                             {loading ? (
                                <p>Cargando negocios...</p>
                            ) : filteredBusinesses.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {filteredBusinesses.map(business => (
                                        <BusinessCard key={business.id} business={business} onClick={() => handleSelectBusiness(business)} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <Frown className="mx-auto h-16 w-16 text-gray-400" />
                                    <h3 className="mt-4 text-2xl font-semibold">No se encontraron resultados</h3>
                                    <p className="mt-2 text-gray-500">Intenta con una búsqueda o filtro diferente.</p>
                                </div>
                            )}
                        </main>
                     </div>
                );
        }
    }
    
    const getTitle = () => {
        switch(currentView) {
            case 'tracking': return 'Seguimiento de Pedido';
            case 'history': return 'Historial de Pedidos';
            case 'businessDetail': return selectedBusiness?.name || APP_NAME;
            case 'shopping':
            default: return APP_NAME;
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
             <DashboardHeader 
                userName={user.name} 
                onLogout={onLogout} 
                cartItemCount={cart.length} 
                onCartClick={() => setIsCartVisible(true)} 
                onHistoryClick={() => setCurrentView('history')}
                title={getTitle()}
             />
             <ConfirmationModal
                isOpen={isClearCartModalVisible}
                onClose={() => {
                    setIsClearCartModalVisible(false);
                    setProductToAdd(null);
                }}
                onConfirm={handleConfirmClearCart}
                title="Limpiar Carrito"
                message="Tu carrito contiene productos de otro negocio. ¿Deseas limpiarlo para agregar este producto?"
                confirmText="Sí, limpiar"
                cancelText="Cancelar"
             />
             <ShoppingCart 
                isOpen={isCartVisible} 
                onClose={() => setIsCartVisible(false)}
                cart={cart}
                business={cartBusiness}
                userLocation={user.location || MOCK_USER_LOCATION}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onPlaceOrder={handlePlaceOrder}
             />
             {renderContent()}
        </div>
    );
};

export default ClientDashboard;