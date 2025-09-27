
import React, { useState, useEffect } from 'react';
import { Business, Location, Product, FilterState } from '../types';
import { MOCK_USER_LOCATION } from '../constants';
import BusinessCard from '../components/client/BusinessCard';
import ProductCard from '../components/client/ProductCard';
import { Search, Frown, ChevronLeft, ChevronRight, Tag, Star } from 'lucide-react';
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
    { id: 'promo1', image: 'https://picsum.photos/seed/promo1/600/300', title: '50% en tu segunda Pizza', businessName: 'Pizza Bella' },
    { id: 'promo2', image: 'https://picsum.photos/seed/promo2/600/300', title: 'Tacos al Pastor 2x1', businessName: 'Taquería El Pastor' },
    { id: 'promo3', image: 'https://picsum.photos/seed/promo3/600/300', title: 'Envío Gratis +$200', businessName: 'Burger Joint' },
    { id: 'promo4', image: 'https://picsum.photos/seed/promo4/600/300', title: 'Rollos primavera gratis', businessName: 'Sushi Express' },
];

const MOCK_POPULAR_PRODUCTS: (Product & { businessName: string })[] = [
    { id: 'p1', name: 'Tacos al Pastor (3)', price: 60, business_id: 'b1', category: 'Main', description: 'Deliciosos tacos con piña y cilantro.', image: 'https://picsum.photos/seed/tacos-prod/400/300', businessName: 'Taquería El Pastor' },
    { id: 'p2', name: 'Pizza Pepperoni Grande', price: 180, business_id: 'b3', category: 'Main', description: 'Clásica pizza con pepperoni de alta calidad.', image: 'https://picsum.photos/seed/pizza-prod/400/300', businessName: 'Pizza Bella' },
    { id: 'p3', name: 'Doble Queso Hamburguesa', price: 150, business_id: 'b4', category: 'Main', description: 'Con doble carne, doble queso y tocino.', image: 'https://picsum.photos/seed/burger-prod/400/300', businessName: 'Burger Joint' },
    { id: 'p4', name: 'California Roll', price: 120, business_id: 'b2', category: 'Main', description: 'Rollo de sushi con surimi, aguacate y pepino.', image: 'https://picsum.photos/seed/sushi-prod/400/300', businessName: 'Sushi Express' },
];


// Mock API call
const fetchNearbyBusinesses = async (location: Location): Promise<Business[]> => {
  console.log("Fetching businesses near:", location);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 'b1', name: 'Taquería El Pastor', category: 'Mexicana', rating: 4.8, delivery_time: '25-35 min', delivery_fee: 30, image: 'https://picsum.photos/seed/tacos/400/300', location: { lat: 19.4300, lng: -99.1300 }, is_open: true, phone: '5512345678', address: 'Calle Falsa 123', email: 'contacto@elpastor.com' },
        { id: 'b2', name: 'Sushi Express', category: 'Japonesa', rating: 4.6, delivery_time: '30-40 min', delivery_fee: 0, image: 'https://picsum.photos/seed/sushi/400/300', location: { lat: 19.4350, lng: -99.1400 }, is_open: true, phone: '5587654321', address: 'Avenida Siempre Viva 742', email: 'hola@sushiexpress.com' },
        { id: 'b3', name: 'Pizza Bella', category: 'Italiana', rating: 4.9, delivery_time: '20-30 min', delivery_fee: 25, image: 'https://picsum.photos/seed/pizza/400/300', location: { lat: 19.4290, lng: -99.1350 }, is_open: false, phone: '5555555555', address: 'Plaza Central 1', email: 'info@pizzabella.com' },
        { id: 'b4', name: 'Burger Joint', category: 'Americana', rating: 4.5, delivery_time: '35-45 min', delivery_fee: 40, image: 'https://picsum.photos/seed/burger/400/300', location: { lat: 19.4380, lng: -99.1310 }, is_open: true, phone: '5511223344', address: 'Boulevard del Sabor 55', email: 'burgers@joint.com' },
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
            <div ref={scrollRef} className="flex space-x-6 overflow-x-auto pb-4" style={{scrollbarWidth: 'none'}}>
                {MOCK_PROMOTIONS.map(promo => (
                    <div key={promo.id} className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden relative group cursor-pointer" onClick={onLoginRequest}>
                        <img src={promo.image} alt={promo.title} className="w-full h-40 object-cover"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-4">
                            <h3 className="text-white text-xl font-bold">{promo.title}</h3>
                            <p className="text-gray-200 text-sm">{promo.businessName}</p>
                        </div>
                    </div>
                ))}
            </div>
             <button onClick={() => scroll('left')} className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 z-10 hidden md:block"><ChevronLeft/></button>
             <button onClick={() => scroll('right')} className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 z-10 hidden md:block"><ChevronRight/></button>
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
        <div className="container mx-auto p-4 md:p-8">
            <header className="text-center my-8">
                <h1 className="text-5xl font-extrabold text-gray-800 dark:text-white">Pronto Eats</h1>
                <p className="text-xl text-gray-500 dark:text-gray-300 mt-2">Tu comida favorita, a la velocidad de un clic.</p>
            </header>

            <section className="mb-12">
                 <h2 className="text-3xl font-bold mb-6 text-gray-700 dark:text-gray-200 flex items-center"><Tag className="mr-3 text-orange-500"/>Promociones para ti</h2>
                 <PromotionsSlider onLoginRequest={onLoginRequest} />
            </section>
            
            <section className="mb-12">
                 <h2 className="text-3xl font-bold mb-6 text-gray-700 dark:text-gray-200 flex items-center"><Star className="mr-3 text-orange-500"/>Productos Populares</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                     {MOCK_POPULAR_PRODUCTS.map(product => (
                         <ProductCard key={product.id} product={product} businessName={product.businessName} onAddToCart={() => onLoginRequest()} />
                     ))}
                 </div>
            </section>
            
            <div className="relative mb-4 max-w-2xl mx-auto">
                <input
                    type="text"
                    placeholder="Busca por nombre o categoría de restaurante..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-4 pl-12 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
            </div>

             <BusinessFilters
                businesses={businesses}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
            />

            <main>
                <h2 className="text-3xl font-bold mb-6 text-gray-700 dark:text-gray-200">
                    Restaurantes Cerca de Ti
                </h2>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {Array.from({ length: 4 }).map((_, index) => (
                             <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
                                 <div className="w-full h-48 bg-gray-300 dark:bg-gray-700"></div>
                                 <div className="p-4">
                                     <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                     <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
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
                        <h3 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">No se encontraron resultados</h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Intenta con una búsqueda o filtro diferente.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HomePage;
