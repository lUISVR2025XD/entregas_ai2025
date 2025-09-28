import React, { useState, useEffect } from 'react';
import { Business, Location, Product, FilterState } from '../types';
import { MOCK_USER_LOCATION } from '../constants';
import BusinessCard from '../components/client/BusinessCard';
import ProductCard from '../components/client/ProductCard';
import { Search, Frown, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import BusinessFilters from '../components/client/BusinessFilters';

// Local type for promotions
interface Promotion {
    id: string;
    image: string;
    title: string;
    businessName: string;
}

// MOCK DATA for new sections
const MOCK_PROMOTIONS: Promotion[] = [
    { id: 'promo1', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=2072&auto=format&fit=crop', title: '50% en tu segunda Burger', businessName: 'Burger Joint' },
    { id: 'promo2', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1981&auto=format&fit=crop', title: 'Pizza Mediana + Refresco', businessName: 'Pizza Bella' },
    { id: 'promo3', image: 'https://images.unsplash.com/photo-1626803775151-62189345a699?q=80&w=2070&auto=format&fit=crop', title: 'Envío Gratis +$200', businessName: 'Taquería El Pastor' },
    { id: 'promo4', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070&auto=format&fit=crop', title: 'Rollos primavera gratis', businessName: 'Sushi Express' },
];

const MOCK_POPULAR_PRODUCTS: (Product & { businessName: string })[] = [
    { id: 'p1', name: 'Alambre de Pechuga', price: 145, business_id: 'b1', category: 'Main', description: 'Delicioso alambre con piña y cilantro.', image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=1770&auto=format&fit=crop', businessName: 'Taquería El Pastor' },
    { id: 'p2', name: 'Aros de Cebolla 6 Pzas', price: 80, business_id: 'b3', category: 'Main', description: 'Clásica pizza con pepperoni de alta calidad.', image: 'https://images.unsplash.com/photo-1594041183521-72322374c498?q=80&w=1770&auto=format&fit=crop', businessName: 'Pizza Bella' },
    { id: 'p3', name: 'Doble Queso Hamburguesa', price: 150, business_id: 'b4', category: 'Main', description: 'Con doble carne, doble queso y tocino.', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=2072&auto=format&fit=crop', businessName: 'Burger Joint' },
    { id: 'p4', name: 'California Roll', price: 120, business_id: 'b2', category: 'Main', description: 'Rollo de sushi con surimi, aguacate y pepino.', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070&auto=format&fit=crop', businessName: 'Sushi Express' },
];


// Mock API call
const fetchNearbyBusinesses = async (location: Location): Promise<Business[]> => {
  console.log("Fetching businesses near:", location);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 'b1', name: 'Taquería El Pastor', category: 'Mexicana', rating: 4.8, delivery_time: '25-35 min', delivery_fee: 30, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1771&auto=format&fit=crop', location: { lat: 19.4300, lng: -99.1300 }, is_open: true, phone: '5512345678', address: 'Calle Falsa 123', email: 'contacto@elpastor.com' },
        { id: 'b2', name: 'Sushi Express', category: 'Japonesa', rating: 4.6, delivery_time: '30-40 min', delivery_fee: 0, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=1887&auto=format&fit=crop', location: { lat: 19.4350, lng: -99.1400 }, is_open: true, phone: '5587654321', address: 'Avenida Siempre Viva 742', email: 'hola@sushiexpress.com' },
        { id: 'b3', name: 'Pizza Bella', category: 'Italiana', rating: 4.9, delivery_time: '20-30 min', delivery_fee: 25, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop', location: { lat: 19.4290, lng: -99.1350 }, is_open: false, phone: '5555555555', address: 'Plaza Central 1', email: 'info@pizzabella.com' },
        { id: 'b4', name: 'Burger Joint', category: 'Americana', rating: 4.5, delivery_time: '35-45 min', delivery_fee: 40, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1899&auto=format&fit=crop', location: { lat: 19.4380, lng: -99.1310 }, is_open: true, phone: '5511223344', address: 'Boulevard del Sabor 55', email: 'burgers@joint.com' },
      ]);
    }, 1000);
  });
};

interface HomePageProps {
    onLoginRequest: () => void;
}

const PromotionsSlider: React.FC<{onLoginRequest: () => void}> = ({ onLoginRequest }) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };
    return (
        <div className="relative">
            <div ref={scrollRef} className="flex space-x-6 overflow-x-auto pb-4 -mx-4 px-4" style={{scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch'}}>
                {MOCK_PROMOTIONS.map(promo => (
                    <div key={promo.id} className="flex-shrink-0 w-80 bg-white/10 border border-white/20 rounded-lg shadow-lg overflow-hidden relative group cursor-pointer" onClick={onLoginRequest}>
                        <img src={promo.image} alt={promo.title} className="w-full h-48 object-cover"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-4">
                            <h3 className="text-white text-xl font-bold">{promo.title}</h3>
                            <p className="text-gray-200 text-sm">{promo.businessName}</p>
                        </div>
                    </div>
                ))}
            </div>
             <button onClick={() => scroll('left')} className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full shadow-md hover:bg-white/30 backdrop-blur-sm disabled:opacity-50 z-10 hidden md:block"><ChevronLeft/></button>
             <button onClick={() => scroll('right')} className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full shadow-md hover:bg-white/30 backdrop-blur-sm disabled:opacity-50 z-10 hidden md:block"><ChevronRight/></button>
        </div>
    );
};

const HomePage: React.FC<HomePageProps> = ({ onLoginRequest }) => {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
    const [userLocation, setUserLocation] = useState<Location | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const initialFilters: FilterState = {
        categories: [],
        minRating: 0,
        maxDeliveryTime: 0,
        maxDeliveryFee: 0,
    };
    const [filters, setFilters] = useState<FilterState>(initialFilters);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
            },
            (error) => {
                console.error("Error getting location, using mock data.", error);
                setUserLocation(MOCK_USER_LOCATION);
            }
        );
    }, []);

    useEffect(() => {
        if (userLocation) {
            setLoading(true);
            fetchNearbyBusinesses(userLocation).then(data => {
                setBusinesses(data);
                setFilteredBusinesses(data);
                setLoading(false);
            });
        }
    }, [userLocation]);
    
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


    return (
        <div className="min-h-screen bg-[#1A0129] text-white">
            <header className="bg-gradient-to-b from-[#2C0054] to-[#1A0129]">
                <div className="container mx-auto p-4 md:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-wider">vrtelolleva</h1>
                    <button onClick={onLoginRequest} className="p-2">
                        <Menu size={28} />
                    </button>
                </div>
            </header>
            <div className="container mx-auto p-4 md:p-8">
                <div className="relative mb-8 max-w-lg">
                    <input
                        type="text"
                        placeholder="Busca tu restaurante o platillo favo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-4 pl-12 border-none rounded-lg bg-white/20 text-white placeholder-gray-300 text-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-300" />
                </div>
            
                <section className="mb-12">
                     <h2 className="text-3xl font-bold mb-6">Promociones Destacadas</h2>
                     <PromotionsSlider onLoginRequest={onLoginRequest} />
                </section>
            
                <section className="mb-12">
                     <h2 className="text-3xl font-bold mb-6">Platillos Estrella</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                         {MOCK_POPULAR_PRODUCTS.map(product => (
                             <ProductCard key={product.id} product={product} businessName={product.businessName} onAddToCart={() => onLoginRequest()} />
                         ))}
                     </div>
                </section>
            
             <BusinessFilters
                businesses={businesses}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
            />

            <main>
                <h2 className="text-3xl font-bold mb-6">
                    Restaurantes Cerca de Ti
                </h2>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {Array.from({ length: 4 }).map((_, index) => (
                             <div key={index} className="bg-white/10 rounded-lg shadow-md overflow-hidden animate-pulse">
                                 <div className="w-full h-48 bg-white/10"></div>
                                 <div className="p-4">
                                     <div className="h-6 bg-white/10 rounded w-3/4 mb-2"></div>
                                     <div className="h-4 bg-white/10 rounded w-1/2"></div>
                                 </div>
                             </div>
                        ))}
                    </div>
                ) : filteredBusinesses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredBusinesses.map(business => (
                            <BusinessCard key={business.id} business={business} onClick={onLoginRequest} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Frown className="mx-auto h-16 w-16 text-gray-400" />
                        <h3 className="mt-4 text-2xl font-semibold">No se encontraron resultados</h3>
                        <p className="mt-2 text-gray-400">Intenta con una búsqueda o filtro diferente.</p>
                    </div>
                )}
            </main>
        </div>
        </div>
    );
};

export default HomePage;