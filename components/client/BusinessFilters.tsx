
import React, { useMemo } from 'react';
import { Business, FilterState } from '../../types';
import Card from '../ui/Card';
import StarRating from '../ui/StarRating';
import Button from '../ui/Button';
import { SlidersHorizontal, X } from 'lucide-react';

interface BusinessFiltersProps {
  businesses: Business[];
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onClearFilters: () => void;
}

const BusinessFilters: React.FC<BusinessFiltersProps> = ({ businesses, filters, onFilterChange, onClearFilters }) => {
  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    businesses.forEach(b => categories.add(b.category));
    return Array.from(categories).sort();
  }, [businesses]);

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFilterChange({ categories: newCategories });
  };
  
  const handleRatingChange = (rating: number) => {
      onFilterChange({ minRating: filters.minRating === rating ? 0 : rating });
  }

  const hasActiveFilters = filters.categories.length > 0 || filters.minRating > 0 || filters.maxDeliveryTime > 0 || filters.maxDeliveryFee > 0;

  return (
    <Card className="p-4 mb-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <h3 className="text-lg font-semibold flex items-center">
            <SlidersHorizontal className="mr-2 h-5 w-5" />
            Filtros
            </h3>
            
            {/* Rating Filter */}
            <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Calificación:</span>
                <StarRating rating={filters.minRating} setRating={handleRatingChange} />
            </div>

            {/* Delivery Time Filter */}
            <div className="flex items-center gap-2">
                <label htmlFor="deliveryTime" className="font-semibold text-sm">Entrega:</label>
                <select
                    id="deliveryTime"
                    value={filters.maxDeliveryTime}
                    onChange={(e) => onFilterChange({ maxDeliveryTime: parseInt(e.target.value, 10) })}
                    className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-md p-1.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                    <option value="0">Cualquiera</option>
                    <option value="30">Menos de 30 min</option>
                    <option value="45">Menos de 45 min</option>
                    <option value="60">Menos de 60 min</option>
                </select>
            </div>

            {/* Delivery Fee Filter */}
            <div className="flex items-center gap-2">
                <label htmlFor="deliveryFee" className="font-semibold text-sm">Envío:</label>
                <select
                    id="deliveryFee"
                    value={filters.maxDeliveryFee}
                    onChange={(e) => onFilterChange({ maxDeliveryFee: parseInt(e.target.value, 10) })}
                    className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-md p-1.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                    <option value="0">Cualquiera</option>
                    <option value="1">Gratis</option>
                    <option value="30">Menos de $30</option>
                    <option value="50">Menos de $50</option>
                </select>
            </div>

            {hasActiveFilters && (
                <Button onClick={onClearFilters} variant="secondary" className="flex items-center gap-1 text-sm !py-1.5 !px-3">
                    <X className="h-4 w-4" />
                    Limpiar
                </Button>
            )}
        </div>
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 border-t dark:border-gray-700 pt-4">
            {uniqueCategories.map(category => (
                <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={`px-3 py-1 text-sm rounded-full transition-colors border ${
                    filters.categories.includes(category)
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-transparent border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                >
                {category}
                </button>
            ))}
        </div>
      </div>
    </Card>
  );
};

export default BusinessFilters;
