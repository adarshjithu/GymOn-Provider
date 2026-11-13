import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Sun,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import type { IOpeningHour } from '../../types';

export interface ITimeSlot {
  id: string;
  name?: string; // e.g. "Morning", "Evening", "Slot 1", "Slot 2", "Batch 1"
  open: string;
  close: string;
}

export interface IDaySchedule {
  day: string; // 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  isClosed: boolean;
  slots: ITimeSlot[];
}

interface OperatingScheduleManagerProps {
  value: IOpeningHour[];
  onChange: (hours: IOpeningHour[]) => void;
  readOnly?: boolean;
}

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const SLOT_NAME_OPTIONS = [
  'Morning',
  'Evening',
  'Afternoon',
  'General',
  'Women Only',
  'Batch 1',
  'Batch 2',
  'Batch 3',
];

const generateId = () => Math.random().toString(36).substring(2, 9);

/**
 * Parses raw IOpeningHour[] into normalized 7-day schedule with multi-slots support
 */
export function parseOpeningHoursToDaySchedules(openingHours?: IOpeningHour[]): IDaySchedule[] {
  // Initialize standard 7-day schedule
  const schedulesMap: Record<string, IDaySchedule> = {};
  DAYS_OF_WEEK.forEach((day) => {
    schedulesMap[day] = {
      day,
      isClosed: day === 'Sunday',
      slots: [],
    };
  });

  if (!openingHours || openingHours.length === 0) {
    DAYS_OF_WEEK.forEach((day) => {
      schedulesMap[day].slots = [
        {
          id: `${day}-slot-1`,
          name: 'General',
          open: '06:00 AM',
          close: '10:00 PM',
        },
      ];
    });
    return DAYS_OF_WEEK.map((d) => schedulesMap[d]);
  }

  const customDays: IDaySchedule[] = [];

  openingHours.forEach((oh, index) => {
    const rawDay = (oh.day || '').trim();
    if (!rawDay) return;

    // Detect if day has slot name in parentheses, e.g. "Monday (Morning)" or "Monday (Slot 2)"
    const match = rawDay.match(/^([^(]+?)(?:\s*\((.*?)\))?$/);
    const baseDayName = match ? match[1].trim() : rawDay;
    const extractedSlot = (oh.slotName || (match ? match[2] : '') || '').trim();

    // Check for "Monday - Saturday" range
    if (
      baseDayName.toLowerCase().includes('monday - saturday') ||
      baseDayName.toLowerCase().includes('mon - sat')
    ) {
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach((dayName) => {
        if (oh.isClosed) {
          schedulesMap[dayName].isClosed = true;
        } else {
          schedulesMap[dayName].isClosed = false;
          schedulesMap[dayName].slots.push({
            id: `${dayName}-slot-${index}-${generateId()}`,
            name: extractedSlot || (schedulesMap[dayName].slots.length === 0 ? 'Slot 1' : `Slot ${schedulesMap[dayName].slots.length + 1}`),
            open: oh.open || '06:00 AM',
            close: oh.close || '10:00 PM',
          });
        }
      });
      return;
    }

    // Match standard day of week
    const standardDay = DAYS_OF_WEEK.find(
      (d) => d.toLowerCase() === baseDayName.toLowerCase()
    );

    if (standardDay) {
      if (oh.isClosed) {
        schedulesMap[standardDay].isClosed = true;
      } else {
        schedulesMap[standardDay].isClosed = false;
        schedulesMap[standardDay].slots.push({
          id: `${standardDay}-slot-${index}-${generateId()}`,
          name: extractedSlot || (schedulesMap[standardDay].slots.length === 0 ? 'Slot 1' : `Slot ${schedulesMap[standardDay].slots.length + 1}`),
          open: oh.open || '06:00 AM',
          close: oh.close || '10:00 PM',
        });
      }
    } else {
      // Custom named entry
      customDays.push({
        day: rawDay,
        isClosed: Boolean(oh.isClosed),
        slots: oh.isClosed
          ? []
          : [
              {
                id: `custom-slot-${index}`,
                name: extractedSlot || 'General',
                open: oh.open || '06:00 AM',
                close: oh.close || '10:00 PM',
              },
            ],
      });
    }
  });

  // Ensure every open day has at least 1 slot
  DAYS_OF_WEEK.forEach((day) => {
    if (!schedulesMap[day].isClosed && schedulesMap[day].slots.length === 0) {
      schedulesMap[day].slots.push({
        id: `${day}-slot-default`,
        name: 'General',
        open: '06:00 AM',
        close: '10:00 PM',
      });
    }
  });

  return [...DAYS_OF_WEEK.map((d) => schedulesMap[d]), ...customDays];
}

/**
 * Serializes IDaySchedule[] back to IOpeningHour[] for backend storage
 */
export function serializeSchedulesToOpeningHours(schedules: IDaySchedule[]): IOpeningHour[] {
  const result: IOpeningHour[] = [];

  schedules.forEach((daySched) => {
    if (daySched.isClosed || daySched.slots.length === 0) {
      result.push({
        day: daySched.day,
        open: '06:00 AM',
        close: '10:00 PM',
        isClosed: true,
      });
      return;
    }

    if (daySched.slots.length === 1) {
      const slot = daySched.slots[0];
      result.push({
        day: daySched.day,
        open: slot.open || '06:00 AM',
        close: slot.close || '10:00 PM',
        isClosed: false,
        slotName: slot.name || 'General',
      });
      return;
    }

    // Multiple slots for this day
    daySched.slots.forEach((slot, idx) => {
      const label = slot.name?.trim() ? slot.name.trim() : `Slot ${idx + 1}`;
      result.push({
        day: `${daySched.day} (${label})`,
        open: slot.open || '06:00 AM',
        close: slot.close || '10:00 PM',
        isClosed: false,
        slotName: label,
      });
    });
  });

  return result;
}

export const OperatingScheduleManager: React.FC<OperatingScheduleManagerProps> = ({
  value,
  onChange,
  readOnly = false,
}) => {
  const [schedules, setSchedules] = useState<IDaySchedule[]>(() =>
    parseOpeningHoursToDaySchedules(value)
  );
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Sync internal schedule state when incoming value changes from outside
  useEffect(() => {
    const parsed = parseOpeningHoursToDaySchedules(value);
    setSchedules(parsed);
  }, [value]);

  const updateSchedulesAndNotify = (nextSchedules: IDaySchedule[]) => {
    setSchedules(nextSchedules);
    const serialized = serializeSchedulesToOpeningHours(nextSchedules);
    onChange(serialized);
  };

  // Toggle Day Closed
  const handleToggleDayClosed = (dayIndex: number, isClosed: boolean) => {
    const updated = [...schedules];
    updated[dayIndex] = {
      ...updated[dayIndex],
      isClosed,
      slots: isClosed
        ? updated[dayIndex].slots
        : updated[dayIndex].slots.length > 0
        ? updated[dayIndex].slots
        : [{ id: generateId(), name: 'General', open: '06:00 AM', close: '10:00 PM' }],
    };
    updateSchedulesAndNotify(updated);
  };

  // Update Slot Field
  const handleUpdateSlot = (
    dayIndex: number,
    slotIndex: number,
    field: keyof ITimeSlot,
    val: string
  ) => {
    const updated = [...schedules];
    const targetSlots = [...updated[dayIndex].slots];
    targetSlots[slotIndex] = {
      ...targetSlots[slotIndex],
      [field]: val,
    };
    updated[dayIndex] = {
      ...updated[dayIndex],
      slots: targetSlots,
    };
    updateSchedulesAndNotify(updated);
  };

  // Add a new slot to a specific day
  const handleAddSlot = (dayIndex: number) => {
    const updated = [...schedules];
    const currentSlots = updated[dayIndex].slots;
    const slotNumber = currentSlots.length + 1;
    let defaultOpen = '04:00 PM';
    let defaultClose = '10:00 PM';
    let defaultName = `Slot ${slotNumber}`;

    if (slotNumber === 2) {
      defaultName = 'Evening';
      defaultOpen = '04:00 PM';
      defaultClose = '10:00 PM';
    } else if (slotNumber === 3) {
      defaultName = 'Afternoon';
      defaultOpen = '12:00 PM';
      defaultClose = '04:00 PM';
    }

    updated[dayIndex] = {
      ...updated[dayIndex],
      isClosed: false,
      slots: [
        ...currentSlots,
        {
          id: generateId(),
          name: defaultName,
          open: defaultOpen,
          close: defaultClose,
        },
      ],
    };
    updateSchedulesAndNotify(updated);
  };

  // Remove a slot from a specific day
  const handleRemoveSlot = (dayIndex: number, slotIndex: number) => {
    const updated = [...schedules];
    const currentSlots = updated[dayIndex].slots;
    if (currentSlots.length <= 1) return;

    updated[dayIndex] = {
      ...updated[dayIndex],
      slots: currentSlots.filter((_, idx) => idx !== slotIndex),
    };
    updateSchedulesAndNotify(updated);
  };

  // Duplicate Monday's slots to all weekdays (Tue - Fri)
  const handleCopyMonToWeekdays = () => {
    const monday = schedules.find((s) => s.day === 'Monday');
    if (!monday) return;

    const updated = schedules.map((daySched) => {
      if (['Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(daySched.day)) {
        return {
          ...daySched,
          isClosed: monday.isClosed,
          slots: monday.slots.map((s) => ({
            ...s,
            id: generateId(),
          })),
        };
      }
      return daySched;
    });

    updateSchedulesAndNotify(updated);
    showNotice("Copied Monday's schedule to Tuesday through Friday!");
  };

  // Apply Monday's slots to all 7 days
  const handleApplyMonToAllDays = () => {
    const monday = schedules.find((s) => s.day === 'Monday');
    if (!monday) return;

    const updated = schedules.map((daySched) => {
      return {
        ...daySched,
        isClosed: monday.isClosed,
        slots: monday.slots.map((s) => ({
          ...s,
          id: generateId(),
        })),
      };
    });

    updateSchedulesAndNotify(updated);
    showNotice("Applied Monday's schedule to all days of the week!");
  };

  // Preset: Split Shift (Morning: 06:00 AM - 11:30 AM & Evening: 04:30 PM - 10:00 PM)
  const handleApplySplitShiftPreset = () => {
    const updated = schedules.map((daySched) => {
      if (daySched.day === 'Sunday') {
        return {
          ...daySched,
          isClosed: true,
          slots: [],
        };
      }
      return {
        ...daySched,
        isClosed: false,
        slots: [
          {
            id: generateId(),
            name: 'Morning',
            open: '06:00 AM',
            close: '11:30 AM',
          },
          {
            id: generateId(),
            name: 'Evening',
            open: '04:30 PM',
            close: '10:00 PM',
          },
        ],
      };
    });

    updateSchedulesAndNotify(updated);
    showNotice('Applied Split Shift preset (Morning + Evening slots for Mon–Sat)!');
  };

  // Preset: Full Day Continuous (06:00 AM - 10:00 PM)
  const handleApplyFullDayPreset = () => {
    const updated = schedules.map((daySched) => {
      return {
        ...daySched,
        isClosed: daySched.day === 'Sunday',
        slots: [
          {
            id: generateId(),
            name: 'General',
            open: '06:00 AM',
            close: '10:00 PM',
          },
        ],
      };
    });

    updateSchedulesAndNotify(updated);
    showNotice('Applied Full Day Continuous preset (06:00 AM - 10:00 PM)!');
  };

  // Preset: 3 Shifts (Morning, Afternoon, Evening)
  const handleApplyThreeShiftsPreset = () => {
    const updated = schedules.map((daySched) => {
      if (daySched.day === 'Sunday') {
        return {
          ...daySched,
          isClosed: true,
          slots: [],
        };
      }
      return {
        ...daySched,
        isClosed: false,
        slots: [
          {
            id: generateId(),
            name: 'Morning',
            open: '06:00 AM',
            close: '10:30 AM',
          },
          {
            id: generateId(),
            name: 'Afternoon',
            open: '11:30 AM',
            close: '03:30 PM',
          },
          {
            id: generateId(),
            name: 'Evening',
            open: '04:30 PM',
            close: '10:00 PM',
          },
        ],
      };
    });

    updateSchedulesAndNotify(updated);
    showNotice('Applied 3 Shifts preset (Morning, Afternoon, Evening)!');
  };

  const showNotice = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => {
      setBannerNotice(null);
    }, 3500);
  };

  return (
    <div className="space-y-4">
      {/* Header & Preset Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5">
              <Clock className="h-4 w-4 text-[#00A389]" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Operating Schedule & Daily Slots
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#00A389] border border-teal-200">
              Multiple Slots Supported
            </span>
          </div>

          {!readOnly && (
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleCopyMonToWeekdays}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-[#00A389] border border-slate-200 text-[11px] font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Copy Monday's slots to Tuesday, Wednesday, Thursday, Friday"
              >
                <Copy className="h-3 w-3" />
                <span>Copy Mon to Weekdays</span>
              </button>

              <button
                type="button"
                onClick={handleApplyMonToAllDays}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Apply Monday's slots to all 7 days"
              >
                <span>Apply to All 7 Days</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-500">
            Configure custom morning, evening, or shift hours for each day. Add multiple slots per day as needed.
          </p>

          {!readOnly && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Presets:</span>
              <button
                type="button"
                onClick={handleApplySplitShiftPreset}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#00A389] border border-teal-200/80 text-[11px] font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Apply Morning and Evening split shifts across Mon–Sat"
              >
                <Layers className="h-3 w-3 text-[#00A389]" />
                <span>Split Shift (Morning + Evening)</span>
              </button>

              <button
                type="button"
                onClick={handleApplyThreeShiftsPreset}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Apply 3 shift intervals (Morning, Afternoon, Evening)"
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>3 Shifts</span>
              </button>

              <button
                type="button"
                onClick={handleApplyFullDayPreset}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Apply continuous full day single slot"
              >
                <Sun className="h-3 w-3 text-amber-500" />
                <span>Full Day</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notice Pill */}
      {bannerNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2 rounded-xl flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{bannerNotice}</span>
        </div>
      )}

      {/* Daily Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
        {schedules.map((daySched, dayIdx) => {
          const isClosed = daySched.isClosed;
          const slotsCount = daySched.slots.length;

          return (
            <div
              key={daySched.day}
              className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                isClosed
                  ? 'bg-slate-100/60 border-slate-200/60 opacity-80'
                  : 'bg-white border-slate-200/90 shadow-2xs hover:border-[#00A389]/40'
              }`}
            >
              {/* Day Header */}
              <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-800">{daySched.day}</span>
                  {!isClosed && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#00A389] border border-teal-200/60">
                      {slotsCount} {slotsCount === 1 ? 'Slot' : 'Slots'}
                    </span>
                  )}
                </div>

                {!readOnly && (
                  <label className="inline-flex items-center space-x-1.5 text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isClosed}
                      onChange={(e) => handleToggleDayClosed(dayIdx, e.target.checked)}
                      className="rounded text-[#00A389] focus:ring-[#00A389] h-3.5 w-3.5 cursor-pointer"
                    />
                    <span className="text-[11px] font-semibold text-slate-500">Closed</span>
                  </label>
                )}
              </div>

              {/* Day Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                {isClosed ? (
                  <div className="py-6 text-center text-[11px] font-semibold text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Closed for visitors / maintenance
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {daySched.slots.map((slot, slotIdx) => (
                      <div
                        key={slot.id || slotIdx}
                        className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2 group hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          {/* Slot Name / Category */}
                          {!readOnly ? (
                            <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                                #{slotIdx + 1}
                              </span>
                              <input
                                type="text"
                                value={slot.name || `Slot ${slotIdx + 1}`}
                                onChange={(e) =>
                                  handleUpdateSlot(dayIdx, slotIdx, 'name', e.target.value)
                                }
                                placeholder={`Slot ${slotIdx + 1}`}
                                list={`slot-names-${dayIdx}-${slotIdx}`}
                                className="w-28 min-w-0 max-w-full text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#00A389]"
                              />
                              <datalist id={`slot-names-${dayIdx}-${slotIdx}`}>
                                {SLOT_NAME_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt} />
                                ))}
                              </datalist>
                            </div>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-700 truncate">
                              {slot.name || `Slot ${slotIdx + 1}`}
                            </span>
                          )}

                          {/* Delete Slot Button */}
                          {!readOnly && daySched.slots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSlot(dayIdx, slotIdx)}
                              className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Delete this time slot"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Open to Close Timings */}
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 w-full">
                          <input
                            type="text"
                            disabled={readOnly}
                            value={slot.open}
                            onChange={(e) =>
                              handleUpdateSlot(dayIdx, slotIdx, 'open', e.target.value)
                            }
                            placeholder="06:00 AM"
                            className="w-full min-w-0 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-800 text-xs shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#00A389]"
                          />
                          <span className="text-slate-400 text-xs font-semibold px-0.5 select-none shrink-0 text-center">to</span>
                          <input
                            type="text"
                            disabled={readOnly}
                            value={slot.close}
                            onChange={(e) =>
                              handleUpdateSlot(dayIdx, slotIdx, 'close', e.target.value)
                            }
                            placeholder="11:00 AM"
                            className="w-full min-w-0 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-800 text-xs shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#00A389]"
                          />
                        </div>
                      </div>
                    ))}

                    {/* Add Slot Button */}
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleAddSlot(dayIdx)}
                        className="w-full py-2 border border-dashed border-teal-300 hover:border-[#00A389] hover:bg-teal-50/60 rounded-xl text-xs font-bold text-[#00A389] flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-98"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Time Slot (e.g. Evening)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

