"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Bell,
  Settings,
  BarChart3,
  FileText,
} from "lucide-react"

const items = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Plans",
    href: "/admin/plans",
    icon: CreditCard,
  },
  {
    title: "Restaurant Owners",
    href: "/admin/restaurant-owners",
    icon: Users,
  },
  {
    title: "Announcements",
    href: "/admin/announcements",
    icon: Bell,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileText,
  },
  {
    title: "Statistics",
    href: "/admin/statistics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function NavMain() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2">
      {items.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href ? "bg-accent" : "transparent"
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  )
}
