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
  Hamburger
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/restaurants-owner/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />
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
    title: 'Restaurants Management',
    href: '/restaurants-owner/restaurants',
    icon: <Store className="w-5 h-5" />
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
    href: '/restaurants-owner/clients',
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
  {
    title: 'Items',
    href: '/restaurants-owner/items',
    icon: <Hamburger className="w-5 h-5" />
  },
];

export default function RestaurantOwnerSidebar() {
  const pathname = usePathname();

  // State for user data
  const [user, setUser] = useState({
    id:null,
    name: '',
    email: '',
  });

  // Generate DiceBear avatar URL
  const avatarSeed = user.name || user.email || 'default';
//   let avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`;
  const avatarUrl = `https://avatar.iran.liara.run/public/${user.id%83}`
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

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 flex flex-col">
      {/* Profile Section */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50">
          <Image src={`https://avatar.iran.liara.run/public/${user.id%83}`} alt="User Avatar" width={48} height={48} />
          <img
    // src={avatarUrl}
    // alt="User Avatar"
    // width={48}
    // height={48}
    // className="w-12 h-12 rounded-full"
  />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800 leading-tight text-base">{user.name}</span>
          <span className="text-xs text-gray-500 leading-tight">{user.email}</span>
        </div>
      </div>
      {/* Sidebar Navigation */}
      <div className="p-4 flex-1">
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
              >
                <span className="mr-3">{item.icon}</span>
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

