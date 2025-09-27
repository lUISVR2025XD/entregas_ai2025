
import React from 'react';
import { ShoppingCart, LogOut, ClipboardList } from 'lucide-react';
import Button from '../ui/Button';
import { APP_NAME } from '../../constants';

interface DashboardHeaderProps {
  userName: string;
  onLogout: () => void;
  cartItemCount?: number;
  onCartClick?: () => void;
  onHistoryClick?: () => void;
  title?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName, onLogout, cartItemCount, onCartClick, onHistoryClick, title }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
      <h1 className="text-2xl font-bold text-orange-500">{title || APP_NAME}</h1>
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline">Hola, {userName}</span>
        {onHistoryClick && (
            <button onClick={onHistoryClick} className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Historial de Pedidos">
                <ClipboardList className="h-6 w-6" />
            </button>
        )}
        {onCartClick && (
          <button onClick={onCartClick} className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Carrito de Compras">
            <ShoppingCart className="h-6 w-6" />
            {cartItemCount !== undefined && cartItemCount > 0 && (
              <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        )}
        <Button onClick={onLogout} variant="secondary" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
