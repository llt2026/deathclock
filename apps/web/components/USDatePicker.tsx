"use client";
import { useState, useRef, useEffect } from "react";

interface USDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  max?: string;
  min?: string;
}

export default function USDatePicker({ 
  value, 
  onChange, 
  className = "",
  max,
  min
}: USDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert YYYY-MM-DD to display format
  useEffect(() => {
    if (value) {
      const date = new Date(value + "T00:00:00");
      if (!isNaN(date.getTime())) {
        setDisplayValue(date.toLocaleDateString('en-US'));
      }
    } else {
      setDisplayValue("");
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={displayValue}
        placeholder="Select your birth date"
        readOnly
        onClick={() => setIsOpen(!isOpen)}
        className={`${className} cursor-pointer`}
      />
      
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <USCalendar
            value={value}
            onChange={(date) => {
              onChange(date);
              setIsOpen(false);
            }}
            max={max}
            min={min}
          />
        </div>
      )}
    </div>
  );
}

function USCalendar({ 
  value, 
  onChange, 
  max, 
  min 
}: { 
  value: string; 
  onChange: (date: string) => void;
  max?: string;
  min?: string;
}) {
  const today = new Date();
  const currentValue = value ? new Date(value + "T00:00:00") : today;
  const [viewDate, setViewDate] = useState(new Date(currentValue.getFullYear(), currentValue.getMonth(), 1));
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthNamesShort = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // 生成年份范围 (1900-2024)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  
  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const selectYear = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setShowYearPicker(false);
  };

  const selectMonth = (month: number) => {
    setViewDate(new Date(viewDate.getFullYear(), month, 1));
    setShowMonthPicker(false);
  };

  const selectDate = (day: number) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const isoString = selectedDate.toISOString().split('T')[0];
    onChange(isoString);
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const isoString = date.toISOString().split('T')[0];
    
    if (max && isoString > max) return true;
    if (min && isoString < min) return true;
    return false;
  };

  if (showYearPicker) {
    return (
      <div className="p-4 w-80 bg-white text-black">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setShowYearPicker(false)}
            className="text-gray-600 hover:text-black p-1"
            type="button"
          >
            ← Back
          </button>
          <span className="font-medium text-lg">Select Year</span>
          <div></div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => selectYear(year)}
              className={`p-2 text-sm rounded transition ${
                year === viewDate.getFullYear()
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 text-black"
              }`}
              type="button"
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (showMonthPicker) {
    return (
      <div className="p-4 w-80 bg-white text-black">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setShowMonthPicker(false)}
            className="text-gray-600 hover:text-black p-1"
            type="button"
          >
            ← Back
          </button>
          <span className="font-medium text-lg">{viewDate.getFullYear()}</span>
          <div></div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {monthNamesShort.map((month, index) => (
            <button
              key={month}
              onClick={() => selectMonth(index)}
              className={`p-3 text-sm rounded transition ${
                index === viewDate.getMonth()
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 text-black"
              }`}
              type="button"
            >
              {month}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-80 bg-white text-black">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="text-gray-600 hover:text-black p-1"
          type="button"
        >
          ←
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMonthPicker(true)}
            className="font-medium text-lg hover:bg-gray-100 px-2 py-1 rounded"
            type="button"
          >
            {monthNames[viewDate.getMonth()]}
          </button>
          <button
            onClick={() => setShowYearPicker(true)}
            className="font-medium text-lg hover:bg-gray-100 px-2 py-1 rounded"
            type="button"
          >
            {viewDate.getFullYear()}
          </button>
        </div>
        <button
          onClick={nextMonth}
          className="text-gray-600 hover:text-black p-1"
          type="button"
        >
          →
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-sm text-gray-600 text-center p-2 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="p-2"></div>
        ))}
        
        {/* Days of the month */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const isSelected = value && 
            new Date(value + "T00:00:00").getDate() === day &&
            new Date(value + "T00:00:00").getMonth() === viewDate.getMonth() &&
            new Date(value + "T00:00:00").getFullYear() === viewDate.getFullYear();
          const isDisabled = isDateDisabled(day);
          const isToday = today.getDate() === day &&
            today.getMonth() === viewDate.getMonth() &&
            today.getFullYear() === viewDate.getFullYear();
          
          return (
            <button
              key={day}
              onClick={() => !isDisabled && selectDate(day)}
              disabled={isDisabled}
              className={`p-2 text-sm rounded transition ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : isToday
                  ? "bg-blue-100 text-blue-600 font-bold"
                  : isDisabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "hover:bg-gray-100 text-black"
              }`}
              type="button"
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
} 