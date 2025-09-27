import React from 'react';
import { Product } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { PlusCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  businessName: string;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, businessName, onAddToCart }) => {
  return (
    <Card className="flex flex-col transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <img src={product.image} alt={product.name} className="w-full h-40 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <h4 className="text-lg font-bold truncate">{product.name}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">de {businessName}</p>
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 flex-grow h-10">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold text-orange-500">${product.price.toFixed(2)}</span>
          <Button onClick={() => onAddToCart(product)} className="flex items-center">
            <PlusCircle className="w-5 h-5 mr-2" />
            Agregar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
