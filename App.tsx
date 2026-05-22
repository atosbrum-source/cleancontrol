import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, Users, DollarSign, BarChart3, Settings, 
  Menu, X, Plus, Search, Bell, Calculator, CloudRain, Sun,
  Smartphone, Package, Briefcase, LayoutDashboard, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSettings } from './contexts/SettingsContext';

import Agenda from './pages/Agenda';
import Clientes from './pages/Clientes';
import Financeiro from './pages/Financeiro';
import Relatorios from './pages/Relatorios';
import Configs from './pages/Configuracoes';
import Estoque from './pages/Estoque';
import Equipe from './pages/Equipe';
import Dashboard from './pages/Dashboard';
import Orcamentos from './pages/Orcamentos';

import { NotificationsMenu } from './components/NotificationsMenu';
import { Calculator as CalculatorComponent } from './components/Calculator';
import NovoOrcamento from './components/NovoOrcamento';
import { Modal } from './components/ui/Modal';
import { DeveloperModeOverlay } from './components/DeveloperModeOverlay';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const hasRestored = React.useRef(false);

  // Restore the last active route on load
  React.useEffect(() => {
    if (hasRestored.current) return;
    hasRestored.current = true;

    const lastRoute = localStorage.getItem('cleancontrol_last_route');
    if (lastRoute && lastRoute !== location.pathname + location.search) {
      navigate(lastRoute, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  // Save the current route whenever it changes
  React.useEffect(() => {
    localStorage.setItem('cleancontrol_last_route', location.pathname + location.search);
  }, [location.pathname, location.search]);

  // Swipe gesture detection (left-to-right to open sidebar in mobile)
  React.useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Only handle mobile size (window width < 1024)
      if (window.innerWidth >= 1024) return;

      // Swipe Right (Open menu)
      // Check if it starts on the left side of the screen (startX < 100)
      // to avoid breaking normal horizontal scrolls/swipes in tables/inputs
      if (deltaX > 80 && Math.abs(deltaY) < 60 && touchStartX < 100) {
        setIsSidebarOpen(true);
      }

      // Swipe Left (Close menu)
      if (deltaX < -80 && Math.abs(deltaY) < 60 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isSidebarOpen]);

  const startAutoCloseTimer = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsSidebarOpen(false);
    }, 5000);
  }, []);

  const stopAutoCloseTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    let originalStyle = '';
    const preventDefaultTouch = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // Permite rolagem apenas dentro do menu aside (sidebar)
      if (!target.closest('aside') && e.cancelable) {
        e.preventDefault();
      }
    };

    if (isSidebarOpen) {
      startAutoCloseTimer();
      originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
    } else {
      stopAutoCloseTimer();
      document.body.style.overflow = '';
    }

    return () => {
      stopAutoCloseTimer();
      document.body.style.overflow = '';
      document.removeEventListener('touchmove', preventDefaultTouch);
    };
  }, [isSidebarOpen, startAutoCloseTimer, stopAutoCloseTimer]);
  const [showCalculator, setShowCalculator] = React.useState(false);
  const [showNewService, setShowNewService] = React.useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Agenda', path: '/agenda', icon: Calendar },
    { name: 'Orçamentos', path: '/orcamentos', icon: FileText },
    { name: 'Equipe', path: '/equipe', icon: Briefcase },
    { name: 'Clientes', path: '/clientes', icon: Users },
    { name: 'Financeiro', path: '/financeiro', icon: DollarSign },
    { name: 'Estoque', path: '/estoque', icon: Package },
    { name: 'Relatórios', path: '/relatorios', icon: BarChart3 },
    { name: 'Configurações', path: '/configuracoes', icon: Settings },
  ];

  return (
    <div className={cn(
      "min-h-screen bg-white transition-colors duration-200 flex flex-col",
      settings.theme === 'dark' && "bg-slate-900 text-white",
      settings.fontSize === 'small' && "text-sm",
      settings.fontSize === 'medium' && "text-base",
      settings.fontSize === 'large' && "text-lg"
    )}>
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-3 md:px-6 py-3 md:py-4 bg-white/80 backdrop-blur-xl border-b border-slate-100 dark:bg-slate-900/80 dark:border-slate-800 w-full">
        <div className="flex items-center gap-2 md:gap-5 min-w-0 flex-1 pr-2">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-all active:scale-95 border border-slate-100 dark:border-slate-800 shrink-0 flex items-center gap-1.5"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            <span className="text-[11px] font-black uppercase tracking-wider italic text-blue-900 dark:text-blue-400">Menu</span>
          </button>
          
          <div className="flex items-center gap-2 md:gap-4 overflow-hidden min-w-0">
            {settings.logoUrl ? (
              <div className="p-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shrink-0">
                <img src={settings.logoUrl} alt="Logo" className="h-5 md:h-8 w-auto object-contain" />
              </div>
            ) : (
              <div className="w-7 h-7 md:w-11 md:h-11 rounded-lg md:rounded-[1rem] bg-blue-900 flex items-center justify-center text-white font-black text-[10px] md:text-base italic shadow-lg shadow-blue-900/30 transform rotate-3 shrink-0">
                CC
              </div>
            )}
            <div className="flex flex-col truncate min-w-0">
              <span className="font-black text-sm xs:text-base sm:text-lg md:text-2xl text-blue-900 dark:text-blue-400 tracking-tighter uppercase italic leading-none truncate block">
                {settings.companyName || 'CleanControl'}
              </span>
              <span className="text-[7px] md:text-[10px] font-black tracking-widest text-slate-400 uppercase italic ml-0.5 truncate shrink-0">Management Suite</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6 shrink-0">
          <div className="relative hidden lg:block">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Pesquisa rápida..." 
              className="pl-12 pr-6 py-3 rounded-[1.5rem] bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-900/5 focus:bg-white focus:border-blue-900/20 w-80 dark:bg-slate-800 dark:border-slate-700 transition-all font-bold italic shadow-inner"
            />
          </div>
          
          <NotificationsMenu />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          onMouseEnter={stopAutoCloseTimer}
          onMouseLeave={startAutoCloseTimer}
          onClick={(e) => {
            // Stop propagation to prevent accidental clicks outside to close it? 
            // Actually, we want to reset the timer on click inside.
            startAutoCloseTimer();
          }}
          className={cn(
            "fixed inset-y-0 left-0 z-[60] w-[280px] bg-white/95 backdrop-blur-2xl border-r border-slate-100 transition-all duration-300 ease-in-out transform dark:bg-slate-900/95 dark:border-slate-800",
            !isSidebarOpen && "-translate-x-full shadow-none pointer-events-none",
            isSidebarOpen && "shadow-[20px_0_60px_-15px_rgba(0,0,0,0.1)] pointer-events-auto"
          )}
        >
          <nav className="p-6 space-y-3 lg:overflow-y-auto max-h-full scrollbar-hide">
             <div className="px-4 pb-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic mb-4">Principal</p>
             </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "group flex items-center gap-4 px-5 py-4 rounded-[1.8rem] transition-all relative overflow-hidden",
                    isActive 
                      ? "bg-blue-900 text-white shadow-xl shadow-blue-900/30" 
                      : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-xl transition-all group-hover:scale-110",
                    isActive ? "bg-white/10" : "bg-slate-50 dark:bg-slate-800"
                  )}>
                    <Icon size={20} className={isActive ? "text-white" : "text-blue-900"} />
                  </div>
                  <span className="font-black italic uppercase text-xs tracking-widest">{item.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-slate-900/60 backdrop-blur-md" 
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-w-0 bg-[#fafafa] dark:bg-slate-950 min-h-full overflow-x-hidden p-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/orcamentos" element={<Orcamentos />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/financeiro" element={<Financeiro />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/estoque" element={<Estoque />} />
                <Route path="/equipe" element={<Equipe />} />
                <Route path="/configuracoes" element={<Configs />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 flex flex-col gap-4 md:gap-5 z-[50]">
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 5, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCalculator(!showCalculator)}
          className="p-3 md:p-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md text-blue-900 dark:text-blue-400 rounded-xl md:rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-blue-900/10 transition-all active:scale-95 opacity-50 hover:opacity-100"
          title="Calculadora"
        >
          <Calculator size={18} className="md:size-[22px]" />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1, rotate: -5, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowNewService(true)}
          className="p-3 md:p-4 bg-blue-900/40 backdrop-blur-md text-white rounded-xl md:rounded-2xl shadow-lg shadow-blue-900/20 hover:bg-blue-900 transition-all font-black active:scale-95 opacity-50 hover:opacity-100"
        >
          <Plus size={18} className="md:size-[22px]" />
        </motion.button>
      </div>

      <Modal 
        isOpen={showNewService} 
        onClose={() => setShowNewService(false)} 
        title="Novo Orçamento / Agendamento"
        size="xl"
      >
        <NovoOrcamento 
          onSuccess={() => setShowNewService(false)}
          onCancel={() => setShowNewService(false)}
        />
      </Modal>

      {/* Calculator Modal */}
      <AnimatePresence>
        {showCalculator && (
          <CalculatorComponent onClose={() => setShowCalculator(false)} />
        )}
      </AnimatePresence>
      <DeveloperModeOverlay />
    </div>
  );
}
