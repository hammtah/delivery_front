'use client'
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Trash2, Clock, Power } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function WorkingHoursPage() {
  const params = useParams();
  const [workingHours, setWorkingHours] = useState([]);
  const [newProgram, setNewProgram] = useState({
    name: '',
    working_days: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});

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
        times: [{ start: '', end: '' }]
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
          'working-days': newProgram.working_days.map(day => ({
            eday: day.eday.toLowerCase(),
            times: day.times.map(time => ({
              start: time.start,
              end: time.end
            }))
          }))
        })
      });

      if (!response.ok) throw new Error('Failed to create working hours');
      
      // Reset form and refresh data
      setNewProgram({ name: '', working_days: [] });
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
    <div className="p-8 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Working Hours</h1>

      {/* Existing Working Hours */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Programs</h2>
        {workingHours.map((program) => (
          <div key={program.id} className="bg-white p-4 rounded-lg shadow mb-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-lg">{program.name}</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  {loadingStates[`active-${program.id}`] ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  ) : (
                    <Switch
                      id={`active-${program.id}`}
                      checked={program.is_active}
                      onCheckedChange={(checked) => handleActivation(program.id, checked)}
                      disabled={loadingStates[`active-${program.id}`] || loadingStates[`auto-${program.id}`]}
                    />
                  )}
                  <Label htmlFor={`active-${program.id}`} className="text-sm text-gray-600">
                    Active
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  {loadingStates[`auto-${program.id}`] ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  ) : (
                    <Switch
                      id={`auto-${program.id}`}
                      checked={program.is_auto_active}
                      onCheckedChange={(checked) => handleAutoActivation(program.id, checked)}
                      disabled={loadingStates[`active-${program.id}`] || loadingStates[`auto-${program.id}`]}
                    />
                  )}
                  <Label htmlFor={`auto-${program.id}`} className="text-sm text-gray-600">
                    Auto-Activate
                  </Label>
                </div>
              </div>
            </div>
            {program.working_days.map((day, index) => (
              <div key={index} className="ml-4 mb-2">
                <p className="font-medium">{day.eday}</p>
                {day.working_times.map((time, timeIndex) => (
                  <p key={timeIndex} className="ml-4 text-gray-600">
                    {time.time_start} - {time.time_end}
                  </p>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* New Working Hours Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Add New Program</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Program Name
          </label>
          <input
            type="text"
            value={newProgram.name}
            onChange={(e) => setNewProgram(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {newProgram.working_days.map((day, dayIndex) => (
          <div key={dayIndex} className="mb-4 p-4 border rounded-md">
            <div className="flex justify-between items-center mb-2">
              <select
                value={day.eday}
                onChange={(e) => {
                  const updatedDays = [...newProgram.working_days];
                  updatedDays[dayIndex].eday = e.target.value;
                  setNewProgram(prev => ({ ...prev, working_days: updatedDays }));
                }}
                className="p-2 border rounded-md"
                required
              >
                <option value="">Select Day</option>
                {DAYS_OF_WEEK.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeWorkingDay(dayIndex)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            {day.times.map((time, timeIndex) => (
              <div key={timeIndex} className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <input
                  type="time"
                  value={time.start}
                  onChange={(e) => {
                    const updatedDays = [...newProgram.working_days];
                    updatedDays[dayIndex].times[timeIndex].start = e.target.value;
                    setNewProgram(prev => ({ ...prev, working_days: updatedDays }));
                  }}
                  className="p-2 border rounded-md"
                  required
                />
                <span>to</span>
                <input
                  type="time"
                  value={time.end}
                  onChange={(e) => {
                    const updatedDays = [...newProgram.working_days];
                    updatedDays[dayIndex].times[timeIndex].end = e.target.value;
                    setNewProgram(prev => ({ ...prev, working_days: updatedDays }));
                  }}
                  className="p-2 border rounded-md"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeTimeSlot(dayIndex, timeIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addTimeSlot(dayIndex)}
              className="mt-2 text-blue-500 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Time Slot
            </button>
          </div>
        ))}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={addWorkingDay}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Day
          </button>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Save Program
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
} 