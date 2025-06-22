"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Bell,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    name: 'Plan Management',
    href: '/admin/plans',
    icon: CreditCard,
    subItems: [
      { name: 'All Plans', href: '/admin/plans' },
      { name: 'Subscribers', href: '/admin/plans/subscribers' },
      { name: 'Revenue', href: '/admin/plans/revenue' },
      { name: 'Reports', href: '/admin/plans/reports' },
      { name: 'Statistics', href: '/admin/plans/statistics' }
    ]
  },
  {
    name: 'Restaurant Owners',
    href: '/admin/restaurant-owners',
    icon: Users,
    subItems: [
      { name: 'All Owners', href: '/admin/restaurant-owners' },
      { name: 'Statistics', href: '/admin/restaurant-owners/statistics' }
    ]
  },
  {
    name: 'Announcements',
    href: '/admin/announcements',
    icon: Bell
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r h-screen">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
      </div>
      <nav className="space-y-1 px-3">
        {navigation.map((item) => (
          <div key={item.name}>
            <Link
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                pathname === item.href
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
            {item.subItems && (
              <div className="ml-8 mt-1 space-y-1">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    className={`block px-3 py-2 text-sm font-medium rounded-md ${
                      pathname === subItem.href
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {subItem.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
} 