'use client'

import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';
import { ScrollArea } from './scroll-area';

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export function TimePicker({ value, onChange, label, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);

  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      setSelectedHour(hours);
      setSelectedMinute(minutes);
    } else {
      // Set default to 00:00 or current time
      const now = new Date();
      setSelectedHour(now.getHours());
      setSelectedMinute(now.getMinutes());
    }
  }, [value]);

  const handleTimeSelect = (hour = selectedHour, minute = selectedMinute) => {
    const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    // We pass the time string back to the parent, not a Date object
    onChange(formattedTime);
    // Keep popover open until minute is selected in the UI approach we used before
    // With scrolling columns, selection is more immediate
    // setIsOpen(false); // Keep open to allow hour and minute selection
  };

  const handleHourSelect = (hour) => {
    setSelectedHour(hour);
    // Optionally close or move to minute selection
    // handleTimeSelect(hour, selectedMinute); // Update immediately on hour select?
  };

  const handleMinuteSelect = (minute) => {
    setSelectedMinute(minute);
    handleTimeSelect(selectedHour, minute); // Update and close on minute select
    setIsOpen(false); // Close after minute selection
  };

  const formatTimeDisplay = (timeString) => {
    if (!timeString) return 'Select time';
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 'Invalid time'; // Handle NaN case
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("w-full", className)}>
      {label && <label className="text-sm font-medium mb-1.5 block">{label}</label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            {formatTimeDisplay(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-0" align="start">
          <div className="flex h-[200px]">
            {/* Hours Column */}
            <ScrollArea className="w-1/2 border-r">
              <div className="flex flex-col items-center py-2">
                {HOURS_24.map((hour) => (
                  <Button
                    key={hour}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full text-center py-2 h-auto text-base font-normal",
                      selectedHour === hour && "text-blue-600 font-medium bg-blue-50"
                    )}
                    onClick={() => handleHourSelect(hour)}
                  >
                    {hour.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
            </ScrollArea>

            {/* Minutes Column */}
            <ScrollArea className="w-1/2">
              <div className="flex flex-col items-center py-2">
                {MINUTES.map((minute) => (
                  <Button
                    key={minute}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full text-center py-2 h-auto text-base font-normal",
                      selectedMinute === minute && "text-blue-600 font-medium bg-blue-50"
                    )}
                    onClick={() => handleMinuteSelect(minute)}
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 