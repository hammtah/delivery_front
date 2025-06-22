import { Card, CardContent } from "@/components/ui/card";
import { Store, Truck, Package, DollarSign, Users, MapPin, Clock, Settings } from "lucide-react";
import Link from 'next/link';

const quickActions = [
  {
    title: "Add Restaurant",
    description: "Create a new restaurant",
    icon: Store,
    href: "/restaurants-owner/restaurants/create-restaurant",
    color: "text-blue-600"
  },
  {
    title: "Add Driver",
    description: "Register a new driver",
    icon: Truck,
    href: "/restaurants-owner/drivers/create",
    color: "text-green-600"
  },
  {
    title: "Manage Items",
    description: "Update menu items",
    icon: Package,
    href: "/restaurants-owner/items",
    color: "text-purple-600"
  },
  {
    title: "View Invoices",
    description: "Check financial reports",
    icon: DollarSign,
    href: "/restaurants-owner/invoices",
    color: "text-orange-600"
  },
  {
    title: "Manage Clients",
    description: "View customer information",
    icon: Users,
    href: "/restaurants-owner/client",
    color: "text-indigo-600"
  },
  {
    title: "Manage Zones",
    description: "Configure delivery zones",
    icon: MapPin,
    href: "/restaurants-owner/zones",
    color: "text-red-600"
  },
  {
    title: "Working Hours",
    description: "Set restaurant schedules",
    icon: Clock,
    href: "/restaurants-owner/working-hours",
    color: "text-yellow-600"
  },
  {
    title: "Settings",
    description: "Configure preferences",
    icon: Settings,
    href: "/restaurants-owner/settings",
    color: "text-gray-600"
  }
];

export default function QuickActions() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group hover:scale-105">
                <CardContent className="p-6 text-center">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${action.color} group-hover:scale-110 transition-transform`} />
                  <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 