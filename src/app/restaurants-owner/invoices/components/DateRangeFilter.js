'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function DateRangeFilter({ onDateRangeChange }) {
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    key: 'selection'
  });

  const handleDateSelect = (ranges) => {
    setDateRange(ranges.selection);
    onDateRangeChange({
      from: ranges.selection.startDate,
      to: ranges.selection.endDate
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !dateRange.startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.startDate ? (
              dateRange.endDate ? (
                <>
                  {format(dateRange.startDate, "LLL dd, y")} -{" "}
                  {format(dateRange.endDate, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.startDate, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DateRange
            ranges={[dateRange]}
            onChange={handleDateSelect}
            months={2}
            direction="horizontal"
            showDateDisplay={false}
            rangeColors={['#0ea5e9']}
            minDate={new Date(2020, 0, 1)}
            maxDate={new Date()}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
      {dateRange.startDate && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setDateRange({
              startDate: null,
              endDate: null,
              key: 'selection'
            });
            onDateRangeChange({ from: null, to: null });
          }}
        >
          Clear
        </Button>
      )}
    </div>
  );
} 