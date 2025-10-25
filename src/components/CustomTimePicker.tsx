// components/CustomTimePicker.tsx
import React from "react";

interface CustomTimePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function CustomTimePicker({
  label,
  value,
  onChange,
}: CustomTimePickerProps) {
  const [hour, minute, period] = value
    ? value.match(/(\d+):(\d+)\s*(AM|PM)?/i)?.slice(1) || ["", "", "AM"]
    : ["", "", "AM"];

  const handleSelect = (part: "hour" | "minute" | "period", val: string) => {
    let newHour = hour || "12";
    let newMinute = minute || "00";
    let newPeriod = period || "AM";

    if (part === "hour") newHour = val;
    if (part === "minute") newMinute = val;
    if (part === "period") newPeriod = val;

    onChange(`${newHour.padStart(2, "0")}:${newMinute.padStart(2, "0")} ${newPeriod}`);
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 12 }, (_, i) =>
    (i * 5).toString().padStart(2, "0")
  );
  const periods = ["AM", "PM"];

  return (
    <div className="w-full flex flex-col">
      {label && (
        <label className="text-sm font-semibold text-gray-800 mb-2 select-none">
          {label}
        </label>
      )}
      <div className="flex rounded-lg overflow-hidden border border-gray-300 bg-white">
        <select
          value={hour}
          onChange={(e) => handleSelect("hour", e.target.value)}
          className="w-full px-3 py-2 border-r border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white cursor-pointer transition duration-150"
          aria-label="Select hour"
        >
          <option value="" disabled>
            Hr
          </option>
          {hours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        <span className="inline-flex items-center justify-center w-10 border-r border-gray-300 text-gray-500 select-none">
          :
        </span>

        <select
          value={minute}
          onChange={(e) => handleSelect("minute", e.target.value)}
          className="w-full px-3 py-2 border-r border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white cursor-pointer transition duration-150"
          aria-label="Select minutes"
        >
          <option value="" disabled>
            Min
          </option>
          {minutes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={period}
          onChange={(e) => handleSelect("period", e.target.value)}
          className="w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white cursor-pointer transition duration-150"
          aria-label="Select AM or PM"
        >
          {periods.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
