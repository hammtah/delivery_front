import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Package, Store, Truck, DollarSign, Clock } from "lucide-react";
import { format } from 'date-fns';
import Link from 'next/link';

export default function RecentActivity({ activities, title = "Recent Activity", showViewAll = true, viewAllLink = "#" }) {
  const getActivityIcon = (type) => {
    const icons = {
      delivery: Package,
      restaurant: Store,
      driver: Truck,
      revenue: DollarSign,
      default: Activity
    };
    return icons[type] || icons.default;
  };

  const getActivityColor = (type) => {
    const colors = {
      delivery: 'text-blue-600',
      restaurant: 'text-green-600',
      driver: 'text-purple-600',
      revenue: 'text-orange-600',
      default: 'text-gray-600'
    };
    return colors[type] || colors.default;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>
              Latest activities and updates
            </CardDescription>
          </div>
          {showViewAll && (
            <Link href={viewAllLink}>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent activities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-full bg-gray-100 ${getActivityColor(activity.type)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <span className="text-xs text-gray-500">
                        {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    {activity.status && (
                      <Badge variant="outline" className="mt-2">
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 