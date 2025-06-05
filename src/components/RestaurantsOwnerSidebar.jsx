'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Truck,
  MapPin,
  Store,
  Clock,
  UserCircle,
  Users2,
  CreditCard,
  FileText,
  Receipt,
  Package,
  LayoutDashboard,
  Hamburger,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/restaurants-owner/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />
  },
  {
    title: 'Restaurants Management',
    href: '/restaurants-owner/restaurants',
    icon: <Store className="w-5 h-5" />
  },
  {
    title: 'Items',
    href: '/restaurants-owner/items',
    icon: <Hamburger className="w-5 h-5" />
  },
  {
    title: 'Drivers Management',
    href: '/restaurants-owner/drivers',
    icon: <Truck className="w-5 h-5" />
  },
  {
    title: 'Deliveries Management',
    href: '/restaurants-owner/deliveries',
    icon: <Package className="w-5 h-5" />
  },
  {
    title: 'Zones Management',
    href: '/restaurants-owner/zones',
    icon: <MapPin className="w-5 h-5" />
  },
  {
    title: 'Working Hours',
    href: '/restaurants-owner/working-hours',
    icon: <Clock className="w-5 h-5" />
  },
  {
    title: 'Employees Management',
    href: '/restaurants-owner/employees',
    icon: <Users className="w-5 h-5" />
  },
  {
    title: 'Clients Management',
    href: '/restaurants-owner/client',
    icon: <Users2 className="w-5 h-5" />
  },
  {
    title: 'Subscription',
    href: '/restaurants-owner/subscription',
    icon: <CreditCard className="w-5 h-5" />
  },
  {
    title: 'Invoices',
    href: '/restaurants-owner/invoices',
    icon: <Receipt className="w-5 h-5" />
  },
];

const SidebarContent = ({ user, pathname, isCollapsed }) => (
  <>
    {/* Profile Section - Fixed at top */}
    <div className={`flex items-center gap-3 px-6 py-6 border-b border-gray-100 bg-white ${isCollapsed ? 'justify-center px-2' : ''}`}>
      <div className={`${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'} rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50 flex-shrink-0`}>
        <Image 
          src={`https://avatar.iran.liara.run/public/${user.id%83}`} 
          alt="User Avatar" 
          width={isCollapsed ? 40 : 48} 
          height={isCollapsed ? 40 : 48}
          className="w-full h-full object-cover"
        />
      </div>
      {!isCollapsed && (
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-gray-800 leading-tight text-base truncate">{user.name}</span>
          <span className="text-xs text-gray-500 leading-tight truncate">{user.email}</span>
        </div>
      )}
    </div>
    {/* Sidebar Navigation - Scrollable */}
    <div className="p-4 flex-1 overflow-y-auto">
      <nav className="space-y-1 flex flex-col gap-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center px-[12px] py-[12px] text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={isCollapsed ? item.title : ''}
            >
              <span className={`${isCollapsed ? 'mr-0' : 'mr-3'}`}>{item.icon}</span>
              {!isCollapsed && item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  </>
);

export default function RestaurantOwnerSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // State for user data
  const [user, setUser] = useState({
    id: null,
    name: '',
    email: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          setUser({
            name: parsed.name || '',
            email: parsed.email || '',
            id: parsed.id || null,
          });
        } catch (e) {
          // Fallback to default if parsing fails
        }
      }
    }
  }, []);

  // Desktop sidebar
  const DesktopSidebar = (
    <div 
      className={`hidden md:flex ${isCollapsed && !isHovered ? 'w-20' : 'w-64'} h-screen bg-white border-r border-gray-200 fixed left-0 top-0 flex-col overflow-hidden transition-all duration-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <SidebarContent user={user} pathname={pathname} isCollapsed={isCollapsed && !isHovered} />
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </div>
  );

  // Mobile sidebar
  const MobileSidebar = (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 overflow-hidden">
          <SidebarContent user={user} pathname={pathname} isCollapsed={false} />
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <>
      {DesktopSidebar}
      {MobileSidebar}
    </>
  );
}

