'use client'
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Trash2, Clock, Power, Calendar, ChevronRight } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

// Generate time slots from 00:00 to 23:30 in 30-minute intervals
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export default function WorkingHoursPage() {
  const params = useParams();
  const router = useRouter();
  const [workingHours, setWorkingHours] = useState([]);
  const [newProgram, setNewProgram] = useState({
    name: '',
    active_from: '',
    active_to: '',
    working_days: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [selectedProgram, setSelectedProgram] = useState(null);

  useEffect(() => {
    fetchWorkingHours();
  }, []);

  const fetchWorkingHours = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/restaurant/${params.id}/working-hours`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch working hours');
      const data = await response.json();
      setWorkingHours(data.data);
      
      // Select the first active program by default
      const activeProgram = data.data.find(program => program.is_active);
      if (activeProgram) {
        setSelectedProgram(activeProgram);
      }
      
      // Clear all loading states after data is updated
      setLoadingStates({});
    } catch (err) {
      setError(err.message);
      // Clear loading states on error too
      setLoadingStates({});
    } finally {
      setLoading(false);
    }
  };

  const addWorkingDay = () => {
    setNewProgram(prev => ({
      ...prev,
      working_days: [...prev.working_days, {
        eday: '',
        times: [{ start: '', end: '' }],
        special_date: ''
      }]
    }));
  };

  const addTimeSlot = (dayIndex) => {
    setNewProgram(prev => {
      const updatedDays = [...prev.working_days];
      updatedDays[dayIndex].times.push({ start: '', end: '' });
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      
      // Reset form and refresh data
      setNewProgram({ name: '', active_from: '', active_to: '', working_days: [] });
      fetchWorkingHours();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleActivation = async (workingHourId, isActive) => {
    // Set loading state for this specific switch
    setLoadingStates(prev => ({
      ...prev,
      [`active-${workingHourId}`]: true
    }));

    try {
      const endpoint = isActive ? 'activate' : 'deactivate';
      const response = await fetch(
        `http://127.0.0.1:8000/api/restaurant/${params.id}/working-hours/${workingHourId}/${endpoint}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (!response.ok) throw new Error(`Failed to ${endpoint} working hours`);
      await fetchWorkingHours(); // Wait for the data to be refreshed
    } catch (err) {
      setError(err.message);
      // Clear loading state on error
      setLoadingStates(prev => ({
        ...prev,
        [`active-${workingHourId}`]: false
      }));
    }
  };

  const handleAutoActivation = async (workingHourId, isAutoActive) => {
    // Set loading state for this specific switch
    setLoadingStates(prev => ({
      ...prev,
      [`auto-${workingHourId}`]: true
    }));

    try {
      const endpoint = isAutoActive ? 'activate-auto' : 'deactivate-auto';
      const response = await fetch(
        `http://127.0.0.1:8000/api/restaurant/${params.id}/working-hours/${workingHourId}/${endpoint}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (!response.ok) throw new Error(`Failed to ${endpoint} working hours`);
      await fetchWorkingHours(); // Wait for the data to be refreshed
    } catch (err) {
      setError(err.message);
      // Clear loading state on error
      setLoadingStates(prev => ({
        ...prev,
        [`auto-${workingHourId}`]: false
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto lg:ml-[280px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Working Hours</h1>
        <button
          onClick={() => router.push(`/restaurants-owner/restaurants/${params.id}/working-hours/new`)}
          className="w-full sm:w-auto bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="h-5 w-5" />
          New Program
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
        {/* Programs List - Left Side */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Programs</h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {workingHours.map((program) => (
                <div
                  key={program.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedProgram?.id === program.id 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedProgram(program)}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div>
                      <h3 className="font-medium text-gray-800">{program.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(program.active_from).toLocaleDateString()} - {new Date(program.active_to).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center space-x-2">
                        {loadingStates[`active-${program.id}`] ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        ) : (
                          <Switch
                            id={`active-${program.id}`}
                            checked={program.is_active}
                            onCheckedChange={(checked) => handleActivation(program.id, checked)}
                            disabled={loadingStates[`active-${program.id}`] || loadingStates[`auto-${program.id}`]}
                          />
                        )}
                        <Label htmlFor={`active-${program.id}`} className="text-xs font-medium text-gray-600">
                          Active
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        {loadingStates[`auto-${program.id}`] ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        ) : (
                          <Switch
                            id={`auto-${program.id}`}
                            checked={program.is_auto_active}
                            onCheckedChange={(checked) => handleAutoActivation(program.id, checked)}
                            disabled={loadingStates[`active-${program.id}`] || loadingStates[`auto-${program.id}`]}
                          />
                        )}
                        <Label htmlFor={`auto-${program.id}`} className="text-xs font-medium text-gray-600">
                          Auto
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Program Details - Right Side */}
        <div className="lg:col-span-8">
          {selectedProgram ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 md:p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">{selectedProgram.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(selectedProgram.active_from).toLocaleDateString()} - {new Date(selectedProgram.active_to).toLocaleDateString()}
                </p>
              </div>

              {/* Regular Schedule */}
              <div className="p-4 md:p-6">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                  <Calendar className="h-4 w-4" />
                  Regular Schedule
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const workingDay = selectedProgram.working_days.find(d => d.eday === day);
                    return (
                      <div key={day} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">{day}</p>
                        {workingDay?.working_times.map((time, index) => (
                          <div
                            key={index}
                            className="bg-blue-100 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700 mb-2"
                          >
                            {time.time_start} - {time.time_end}
                          </div>
                        ))}
                        {!workingDay?.working_times?.length && (
                          <p className="text-gray-400 text-sm">Closed</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Special Dates */}
              {selectedProgram.working_days.some(day => day.special_date) && (
                <div className="border-t border-gray-100 p-4 md:p-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                    <Calendar className="h-4 w-4" />
                    Special Dates
                  </div>
                  <div className="grid gap-4">
                    {selectedProgram.working_days
                      .filter(day => day.special_date)
                      .map((day, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-700">
                            {new Date(day.special_date).toLocaleDateString(undefined, {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {day.working_times.map((time, timeIndex) => (
                              <div
                                key={timeIndex}
                                className="bg-blue-100 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700"
                              >
                                {time.time_start} - {time.time_end}
                              </div>
                            ))}
                            {day.working_times.length === 0 && (
                              <span className="text-red-500 text-sm font-medium">Closed</span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex items-center justify-center min-h-[400px]">
              <p className="text-gray-500">Select a program to view its details</p>
            </div>
          )}
        </div>
      </div>

      {/* New Program Form */}
      {/* <form id="new-program-form" onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mt-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Add New Program</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program Name
            </label>
            <input
              type="text"
              value={newProgram.name}
              onChange={(e) => setNewProgram(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Holiday Program"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Active From
              </label>
              <input
                type="datetime-local"
                value={newProgram.active_from}
                onChange={(e) => setNewProgram(prev => ({ ...prev, active_from: e.target.value }))}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Active To
              </label>
              <input
                type="datetime-local"
                value={newProgram.active_to}
                onChange={(e) => setNewProgram(prev => ({ ...prev, active_to: e.target.value }))}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {newProgram.working_days.map((day, dayIndex) => (
            <div key={dayIndex} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4 items-center flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <select
                      value={day.eday}
                      onChange={(e) => {
                        const updatedDays = [...newProgram.working_days];
                        updatedDays[dayIndex].eday = e.target.value;
                        setNewProgram(prev => ({ ...prev, working_days: updatedDays }));
                      }}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required={!day.special_date}
                    >
                      <option value="">Select Day</option>
                      {DAYS_OF_WEEK.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <span className="text-gray-500 font-medium">OR</span>
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="date"
                      value={day.special_date}
                      onChange={(e) => {
                        const updatedDays = [...newProgram.working_days];
                        updatedDays[dayIndex].special_date = e.target.value;
                        setNewProgram(prev => ({ ...prev, working_days: updatedDays }));
                      }}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required={!day.eday}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeWorkingDay(dayIndex)}
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {day.times.map((time, timeIndex) => (
                  <div key={timeIndex} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <input
                      type="time"
                      value={time.start}
                      onChange={(e) => {
                        const updatedDays = [...newProgram.working_days];
                        updatedDays[dayIndex].times[timeIndex].start = e.target.value;
                        setNewProgram(prev => ({ ...prev, working_days: updatedDays }));
                      }}
                      className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                    <span className="text-gray-500 font-medium">to</span>
                    <input
                      type="time"
                      value={time.end}
                      onChange={(e) => {
                        const updatedDays = [...newProgram.working_days];
                        updatedDays[dayIndex].times[timeIndex].end = e.target.value;
                        setNewProgram(prev => ({ ...prev, working_days: updatedDays }));
                      }}
                      className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(dayIndex, timeIndex)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addTimeSlot(dayIndex)}
                className="mt-4 text-blue-500 hover:text-blue-700 flex items-center gap-2 hover:bg-blue-50 p-2 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Time Slot
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={addWorkingDay}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Add Day
          </button>

          <button
            type="submit"
            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            Save Program
          </button>
        </div>
      </form> */}

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
} 