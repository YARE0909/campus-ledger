import React, { useMemo } from "react";

interface CustomTimePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}

function parseTime(value: string) {
  if (!value) return { hour: "", minute: "", period: "AM" };

  const trimmed = value.trim();

  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return { hour: "", minute: "", period: "AM" };

  const hourNum = Number(match[1]);
  const minute = match[2];
  const period = (match[3] || "AM").toUpperCase();

  return {
    hour: String(hourNum), // no leading zero, so it matches the <option> values
    minute,
    period: period === "PM" ? "PM" : "AM",
  };
}

export default function CustomTimePicker({
  label,
  value,
  onChange,
}: CustomTimePickerProps) {
  const parsed = useMemo(() => parseTime(value), [value]);

  const handleSelect = (part: "hour" | "minute" | "period", val: string) => {
    const newHour = part === "hour" ? val : parsed.hour || "12";
    const newMinute = part === "minute" ? val : parsed.minute || "00";
    const newPeriod = part === "period" ? val : parsed.period || "AM";

    onChange(`${newHour}:${newMinute} ${newPeriod}`);
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 12 }, (_, i) =>
    String(i * 5).padStart(2, "0"),
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
          value={parsed.hour}
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
          value={parsed.minute}
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
          value={parsed.period}
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