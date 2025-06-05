"use client"

import * as React from "react"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DatePickerWithRangeProps {
  className?: string;
  value?: DateRange;
  onChange?: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  value,
  onChange,
}: DatePickerWithRangeProps) {
  const [startDate, setStartDate] = React.useState<Date | undefined>(value?.from)
  const [endDate, setEndDate] = React.useState<Date | undefined>(value?.to)
  const [startTime, setStartTime] = React.useState<string>(value?.from ? format(value.from, "HH:mm") : "00:00")
  const [endTime, setEndTime] = React.useState<string>(value?.to ? format(value.to, "HH:mm") : "23:59")

  const handleDateChange = (type: 'start' | 'end', date: Date | undefined) => {
    if (type === 'start') {
      setStartDate(date)
      if (date && startTime) {
        const [hours, minutes] = startTime.split(':')
        date.setHours(parseInt(hours), parseInt(minutes))
      }
    } else {
      setEndDate(date)
      if (date && endTime) {
        const [hours, minutes] = endTime.split(':')
        date.setHours(parseInt(hours), parseInt(minutes))
      }
    }
    
    if (startDate && endDate) {
      onChange?.({ from: startDate, to: endDate })
    }
  }

  const handleTimeChange = (type: 'start' | 'end', time: string) => {
    if (type === 'start') {
      setStartTime(time)
      if (startDate) {
        const [hours, minutes] = time.split(':')
        const newDate = new Date(startDate)
        newDate.setHours(parseInt(hours), parseInt(minutes))
        setStartDate(newDate)
      }
    } else {
      setEndTime(time)
      if (endDate) {
        const [hours, minutes] = time.split(':')
        const newDate = new Date(endDate)
        newDate.setHours(parseInt(hours), parseInt(minutes))
        setEndDate(newDate)
      }
    }

    if (startDate && endDate) {
      onChange?.({ from: startDate, to: endDate })
    }
  }

  return (
    <div className={cn("grid gap-4", className)}>
      <div className="grid gap-2">
        <Label>Start Date & Time</Label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "LLL dd, y") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="single"
                selected={startDate}
                onSelect={(date) => handleDateChange('start', date)}
              />
            </PopoverContent>
          </Popover>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => handleTimeChange('start', e.target.value)}
            className="w-[120px]"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>End Date & Time</Label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "LLL dd, y") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="single"
                selected={endDate}
                onSelect={(date) => handleDateChange('end', date)}
              />
            </PopoverContent>
          </Popover>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => handleTimeChange('end', e.target.value)}
            className="w-[120px]"
          />
        </div>
      </div>
    </div>
  )
} 