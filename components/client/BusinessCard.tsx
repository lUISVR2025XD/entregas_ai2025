
import React from 'react';
import { Business } from '../../types';
import Card from '../ui/Card';
import { Star, Clock } from 'lucide-react';

interface BusinessCardProps {
  business: Business;
  onClick?: () => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business, onClick }) => {
  return (
    <Card 
      onClick={onClick}
      className={`transform transition-transform duration-300 hover:scale-105 hover:shadow-xl ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="relative">
        <img src={business.image} alt={business.name} className="w-full h-48 object-cover" />
        {!business.is_open && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">CERRADO</span>
            </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold truncate">{business.name}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{business.category}</p>
        <div className="flex justify-between items-center mt-2 text-sm">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
            <span className="font-semibold">{business.rating}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{business.delivery_time}</span>
          </div>
          <div className="font-semibold">
            ${business.delivery_fee.toFixed(2)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BusinessCard;