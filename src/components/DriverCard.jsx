"use client";

import { User, Phone, Navigation } from "lucide-react";

export default function DriverCard({ 
  driver, 
  isSelected, 
  onClick 
}) {
  return (
    <div
      className={`p-3 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-primary/5'
          : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
            {driver.user.image ? (
              <img
                src={driver.user.image}
                alt={driver.user.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1">
            <div className={`w-2.5 h-2.5 rounded-full border-2 border-white ${
              driver.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium truncate">{driver.user.name}</h3>
            <span className="text-xs text-gray-500 capitalize">
              {driver.type === 'both' ? 'Monthly And Per delivery' : driver.type.replace('_', ' ')} Payed Driver
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
            <Phone className="h-3 w-3" />
            <span className="truncate">{driver.user.phone}</span>
          </div>
          {driver.distance_to_restaurant && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <Navigation className="h-3 w-3" />
              <span>{driver.distance_to_restaurant.toFixed(1)} km</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 