'use client';

import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/utils";
import { Clock, CreditCard, User, DollarSign, Calendar, Package } from "lucide-react";
// import Image from "next/image";

export default function CommissionCard({ commission, isSelected, onSelect }) {
  const {
    id,
    etime_arrival,
    rtime_arrival,
    commission: commission_amount,
    fees,
    commission_payment_date,
    payment_type,
    type,
    driver,
  } = commission;

  const isPaid = commission_payment_date !== null;
  const amountToPay = (commission_amount * fees / 100).toFixed(2);

  return (
    <div 
      className={`p-3 border rounded-lg ${isSelected ? 'border-primary bg-primary/5' : 'border-border'} hover:border-primary/50 transition-colors cursor-pointer`}
      onClick={() => !isPaid && onSelect()}
    >
      <div className="flex items-center gap-4 ">
        {!isPaid && (
          <Checkbox 
            checked={isSelected}
            onCheckedChange={onSelect}
            className="mt-1 "
          />
        )}
        
        <div className="flex-1 flex items-center justify-between gap-4">
          {/* Left Section - Delivery Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span className="font-medium">#{id}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CreditCard className="w-3 h-3" />
              {/* <span>{payment_type === 'cod' ? 'Cash On Delivery' : payment_type.toUpperCase()}</span> */}
              <span>{payment_type.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{type.toUpperCase()}</span>
            </div>
          </div>

          {/* Middle Section - Driver Info */}
          {driver && (
            <div className="flex items-center gap-2">
              <img
                src={driver.user.image}
                alt={driver.user.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <div className="text-sm">
                <p className="font-medium truncate max-w-[100px] flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {driver.user.name}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[100px]">
                  {driver.user.phone}
                </p>
              </div>
            </div>
          )}

          {/* Right Section - Commission Info */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <span className="text-xs text-gray-500">Rate:</span>
                <span className="font-medium text-primary">{commission_amount}%</span>
              </div>
              <div className="flex items-center gap-1 justify-end">
                <span className="text-xs text-gray-500">Base:</span>
                <span className="font-medium">${fees.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <span className="text-xs text-gray-500">To Pay:</span>
                <span className="font-medium text-lg text-primary">${amountToPay}</span>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                <Calendar className="w-3 h-3" />
                {rtime_arrival ? formatDate(rtime_arrival) : formatDate(etime_arrival)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 