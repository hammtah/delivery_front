'use client'
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Trash2, Clock, ArrowLeft, Calendar, Info, X, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import { Calendar as UiCalendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateTimePicker24h } from "@/components/ui/date-time-picker";
import { TimePicker } from "@/components/ui/time-picker";

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function NewWorkingHoursPage() {
  const params = useParams();
  const router = useRouter();
  const [newProgram, setNewProgram] = useState({
    name: '',
    active_from: '',
    active_to: '',
    working_days: []
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [activeFrom, setActiveFrom] = useState(new Date());
  const [activeTo, setActiveTo] = useState(new Date(new Date().setDate(new Date().getDate() + 20)));

  const addWorkingDay = () => {
    setNewProgram(prev => ({
      ...prev,
      working_days: [...prev.working_days, {
        eday: '',
        times: [{ start: '', end: '' }],
        special_date: ''
      }]
    }));
    setIsSidebarOpen(true);
  };

  const addTimeSlot = (dayIndex) => {
    setNewProgram(prev => {
      const updatedDays = [...prev.working_days];
      console.log(updatedDays[dayIndex].times)
      updatedDays[dayIndex].times= [...updatedDays[dayIndex].times, { start: '', end: '' }];
      return { ...prev, working_days: updatedDays };
    });
  };

  const removeTimeSlot = (dayIndex, timeIndex) => {
    setNewProgram(prev => {
      const updatedDays = [...prev.working_days];
      updatedDays[dayIndex].times.splice(timeIndex, 1);
      return { ...prev, working_days: updatedDays };
    });
  };

  const removeWorkingDay = (dayIndex) => {
    setNewProgram(prev => {
      const updatedDays = [...prev.working_days];
      updatedDays.splice(dayIndex, 1);
      return { ...prev, working_days: updatedDays };
    });
    setIsSidebarOpen(false);
    setSelectedDayIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/restaurant/${params.id}/working-hours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newProgram.name,
          active_from: newProgram.active_from,
          active_to: newProgram.active_to,
          'working-days': newProgram.working_days.map(day => ({
            eday: day.eday.toLowerCase(),
            times: day.times.map(time => ({
              start: time.start,
              end: time.end
            })),
            special_date: day.special_date || undefined
          }))
        })
      });

      if (!response.ok) throw new Error('Failed to create working hours');
      
      router.push(`/restaurants-owner/restaurants/${params.id}/working-hours`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleActiveFromChange = (date) => {
    if (date) {
      setActiveFrom(date);
      setNewProgram(prev => ({
        ...prev,
        active_from: format(date, "yyyy-MM-dd'T'HH:mm")
      }));
    }
  };

  const handleActiveToChange = (date) => {
    if (date) {
      setActiveTo(date);
      setNewProgram(prev => ({
        ...prev,
        active_to: format(date, "yyyy-MM-dd'T'HH:mm")
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-[1000px] mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">New Working Hours Program</h1>
            <p className="text-gray-500 mt-1">Create a new schedule for your restaurant</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Program Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={newProgram.name}
                  onChange={(e) => setNewProgram(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Holiday Program"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Active Period</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>From</Label>
                    <DateTimePicker24h
                      value={activeFrom}
                      onChange={handleActiveFromChange}
                    />
                  </div>
                  <div>
                    <Label>To</Label>
                    <DateTimePicker24h
                      value={activeTo}
                      onChange={handleActiveToChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Working Days Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-800">Working Days</h2>
                <Badge variant="secondary" className="ml-2">
                  {newProgram.working_days.length} days
                </Badge>
              </div>
              <Button
                type="button"
                onClick={addWorkingDay}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Day
              </Button>
            </CardHeader>
            <CardContent>
              {newProgram.working_days.length > 0 ? (
                <div className="space-y-4">
                  {newProgram.working_days.map((day, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:border-gray-300 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedDayIndex(index);
                        setIsSidebarOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {day.eday || new Date(day.special_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {day.times.length} time slot{day.times.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No working days added yet</p>
                  <p className="text-gray-400 text-sm mt-1">Click "Add Day" to start creating your schedule</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Program'}
            </Button>
          </div>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <Info className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Sidebar for managing days */}
      <div className={`fixed inset-y-0 right-0 w-[500px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">Manage Working Day</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-6">
            {selectedDayIndex !== null && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4 items-center flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <Label>Day of Week</Label>
                      <Select
                        value={newProgram.working_days[selectedDayIndex].eday}
                        onValueChange={(value) => {
                          const updatedDays = [...newProgram.working_days];
                          updatedDays[selectedDayIndex].eday = value;
                          setNewProgram(prev => ({ ...prev, working_days: updatedDays }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map(day => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <span className="text-gray-500 font-medium">OR</span>
                    <div className="flex-1 min-w-[200px]">
                      <Label>Special Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal mt-1.5",
                              !newProgram.working_days[selectedDayIndex].special_date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newProgram.working_days[selectedDayIndex].special_date ? (
                              format(new Date(newProgram.working_days[selectedDayIndex].special_date), "LLL dd, y")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <UiCalendar
                            initialFocus
                            mode="single"
                            selected={newProgram.working_days[selectedDayIndex].special_date ? new Date(newProgram.working_days[selectedDayIndex].special_date) : undefined}
                            onSelect={(date) => {
                              const updatedDays = [...newProgram.working_days];
                              updatedDays[selectedDayIndex].special_date = date ? format(date, "yyyy-MM-dd") : '';
                              setNewProgram(prev => ({ ...prev, working_days: updatedDays }));
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Time Slots</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        addTimeSlot(selectedDayIndex);
                      }}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Slot
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {newProgram.working_days[selectedDayIndex].times.map((time, timeIndex) => (
                      <div key={timeIndex} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <TimePicker
                          value={time.start}
                          onChange={(timeString) => {
                            const updatedDays = [...newProgram.working_days];
                            updatedDays[selectedDayIndex].times[timeIndex].start = timeString;
                            setNewProgram(prev => ({ ...prev, working_days: updatedDays }));
                          }}
                          label="Start Time"
                        />
                        <span className="text-gray-500 font-medium">to</span>
                        <TimePicker
                          value={time.end}
                          onChange={(timeString) => {
                            const updatedDays = [...newProgram.working_days];
                            updatedDays[selectedDayIndex].times[timeIndex].end = timeString;
                            setNewProgram(prev => ({ ...prev, working_days: updatedDays }));
                          }}
                          label="End Time"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTimeSlot(selectedDayIndex, timeIndex)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="p-6 border-t">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (selectedDayIndex !== null) {
                  removeWorkingDay(selectedDayIndex);
                }
              }}
              className="w-full"
            >
              Remove Day
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 