import React, { useState } from 'react';
import { UserRole, Profile } from '../types';
import { USER_ROLES } from '../constants';
import { authService } from '../services/authService';
import Button from './ui/Button';
import { X, User, Briefcase, Bike, ShieldCheck, Mail, Key } from 'lucide-react';

interface AuthModalProps {
    onLoginSuccess: (user: Profile) => void;
    onClose: () => void;
}

const ICONS: { [key in UserRole]?: React.ElementType } = {
  [UserRole.CLIENT]: User,
  [UserRole.BUSINESS]: Briefcase,
  [UserRole.DELIVERY]: Bike,
  [UserRole.ADMIN]: ShieldCheck
};

const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess, onClose }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            let user: Profile | null = null;
            if (isLoginMode) {
                user = await authService.login(email, password);
            } else {
                user = await authService.register(name, email, password, role);
            }
            if (user) {
                onLoginSuccess(user);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full relative transform transition-all duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <X className="h-6 w-6" />
                </button>
                <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-4">
                    {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLoginMode && (
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Nombre Completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                        </div>
                    )}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            placeholder="Correo Electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                    </div>
                    <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                    </div>
                    
                    {!isLoginMode && (
                        <div>
                             <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Selecciona tu rol:</p>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                 {USER_ROLES.filter(r => r.id !== UserRole.ADMIN).map(r => {
                                     const Icon = ICONS[r.id];
                                     return (
                                        <button 
                                            key={r.id} 
                                            type="button"
                                            onClick={() => setRole(r.id)}
                                            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${role === r.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/50' : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'}`}
                                        >
                                            {Icon && <Icon className="h-6 w-6 mb-1" />}
                                            <span className="text-sm font-semibold">{r.name}</span>
                                        </button>
                                     )
                                 })}
                             </div>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
                        {isLoading ? 'Cargando...' : (isLoginMode ? 'Ingresar' : 'Registrarse')}
                    </Button>
                </form>

                <p className="text-center mt-6 text-sm">
                    {isLoginMode ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
                    <button onClick={() => { setIsLoginMode(!isLoginMode); setError(null); }} className="font-semibold text-orange-500 hover:underline ml-1">
                        {isLoginMode ? 'Regístrate' : 'Inicia Sesión'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthModal;
