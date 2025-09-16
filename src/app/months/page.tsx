"use client";

import { useState, useEffect } from "react";
import {
  getData,
  postData,
  putData,
  deleteData,
} from "../../libs/axios/server";

export default function MonthsPage() {
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedMonths, setExpandedMonths] = useState(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState(new Set());

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [isAddingWeek, setIsAddingWeek] = useState(null);
  const [isGeneratingDates, setIsGeneratingDates] = useState(null);
  const [isManagingWeek, setIsManagingWeek] = useState(null);
  const [isManagingDay, setIsManagingDay] = useState(null);

  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedWeekId, setSelectedWeekId] = useState("");
  const [weekLoading, setWeekLoading] = useState(false);

  const [selectedDates, setSelectedDates] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState(null);
  const [dragPreview, setDragPreview] = useState([]);
  const [dragMode, setDragMode] = useState("select");
  const [mouseDownTime, setMouseDownTime] = useState(null);
  const [hasDraggedDistance, setHasDraggedDistance] = useState(false); // 'select' or 'deselect'

  const [weekData, setWeekData] = useState({
    weekNumber: 1,
    startDate: "",
    endDate: "",
  });

  const [dayData, setDayData] = useState({
    weekId: "",
    dayNumber: 1,
    date: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    monthNumber: 1,
    year: 2024,
  });

  useEffect(() => {
    fetchMonths();
  }, []);

  const fetchMonths = async () => {
    try {
      const res = await getData("/months");
      if (res.success) {
        setMonths(res.data);
      } else {
        setError("Failed to load months.");
      }
    } catch (err) {
      console.error("Error fetching months:", err);
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateInSelectedMonth = (date) => {
    if (!date || !isGeneratingDates) return true;
    const selectedMonth = months.find((m) => m._id === isGeneratingDates);
    if (!selectedMonth) return true;

    return (
      date.getFullYear() === selectedMonth.year &&
      date.getMonth() === selectedMonth.monthNumber - 1
    );
  };

  const formatDateForAPI = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isDateSelected = (date) => {
    if (!date) return false;
    return selectedDates.some(
      (selectedDate) => selectedDate.toDateString() === date.toDateString()
    );
  };

  const isDateExisting = (date) => {
    if (!date || !isGeneratingDates) return false;
    const month = months.find((m) => m._id === isGeneratingDates);
    if (!month?.weeks) return false;

    return month.weeks.some(
      (week) =>
        week.days &&
        week.days.some(
          (day) => new Date(day.date).toDateString() === date.toDateString()
        )
    );
  };

  const toggleDateSelection = (date) => {
    setSelectedDates((prev) => {
      const isSelected = prev.some(
        (selectedDate) => selectedDate.toDateString() === date.toDateString()
      );

      if (isSelected) {
        return prev.filter(
          (selectedDate) => selectedDate.toDateString() !== date.toDateString()
        );
      } else {
        return [...prev, date].sort((a, b) => a - b);
      }
    });
  };

  const handleMouseDown = (date) => {
    if (!isDateInSelectedMonth(date)) return;

    setMouseDownTime(Date.now());
    setHasDraggedDistance(false);
    setDragStartDate(date);

    // Determine drag mode based on the initial date's selection state
    const isCurrentlySelected = isDateSelected(date);
    setDragMode(isCurrentlySelected ? "deselect" : "select");
  };

  const handleMouseEnter = (date) => {
    if (!dragStartDate || !isDateInSelectedMonth(date)) return;

    const startDate = dragStartDate;
    const endDate = date;

    // Check if we've moved to a different date (indicating drag)
    if (startDate.toDateString() !== endDate.toDateString()) {
      if (!isDragging) {
        setIsDragging(true);
        setHasDraggedDistance(true);
      }
    }

    if (isDragging || hasDraggedDistance) {
      const start = startDate < endDate ? startDate : endDate;
      const end = startDate < endDate ? endDate : startDate;

      const datesInRange = [];
      const currentDateIter = new Date(start);

      while (currentDateIter <= end) {
        if (isDateInSelectedMonth(currentDateIter)) {
          datesInRange.push(new Date(currentDateIter));
        }
        currentDateIter.setDate(currentDateIter.getDate() + 1);
      }

      setDragPreview(datesInRange);
    }
  };

  const handleMouseUp = (date) => {
    const clickDuration = Date.now() - (mouseDownTime || 0);
    const isQuickClick = clickDuration < 200 && !hasDraggedDistance;

    if (
      isQuickClick &&
      date &&
      dragStartDate &&
      date.toDateString() === dragStartDate.toDateString()
    ) {
      // Handle single click toggle
      toggleDateSelection(date);
    } else if (isDragging && dragPreview.length > 0) {
      // Handle drag selection
      setSelectedDates((prev) => {
        const newSelected = [...prev];

        if (dragMode === "select") {
          // Add dates that aren't already selected
          dragPreview.forEach((date) => {
            const isAlreadySelected = newSelected.some(
              (selectedDate) =>
                selectedDate.toDateString() === date.toDateString()
            );

            if (!isAlreadySelected) {
              newSelected.push(date);
            }
          });
        } else {
          // Remove dates that are currently selected
          dragPreview.forEach((date) => {
            const index = newSelected.findIndex(
              (selectedDate) =>
                selectedDate.toDateString() === date.toDateString()
            );

            if (index !== -1) {
              newSelected.splice(index, 1);
            }
          });
        }

        return newSelected.sort((a, b) => a - b);
      });
    }

    // Reset all drag states
    setIsDragging(false);
    setDragStartDate(null);
    setDragPreview([]);
    setDragMode("select");
    setMouseDownTime(null);
    setHasDraggedDistance(false);
  };

  const isDateInPreview = (date) => {
    return dragPreview.some(
      (previewDate) => previewDate.toDateString() === date.toDateString()
    );
  };

  const getDatePreviewState = (date) => {
    if (!isDateInPreview(date)) return null;

    if (dragMode === "select") {
      return isDateSelected(date) ? "already-selected" : "will-select";
    } else {
      return isDateSelected(date) ? "will-deselect" : "already-deselected";
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const toggleMonth = (monthId) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthId)) {
      newExpanded.delete(monthId);
      const newExpandedWeeks = new Set(expandedWeeks);
      const month = months.find((m) => m._id === monthId);
      month?.weeks?.forEach((week) => {
        newExpandedWeeks.delete(week._id);
      });
      setExpandedWeeks(newExpandedWeeks);
    } else {
      newExpanded.add(monthId);
    }
    setExpandedMonths(newExpanded);
  };

  const toggleWeek = (weekId) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekId)) {
      newExpanded.delete(weekId);
    } else {
      newExpanded.add(weekId);
    }
    setExpandedWeeks(newExpanded);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "monthNumber" || name === "year" ? Number(value) : value,
    }));
  };

  const handleWeekChange = (e) => {
    const { name, value } = e.target;
    setWeekData((prev) => ({
      ...prev,
      [name]: name === "weekNumber" ? Number(value) : value,
    }));
  };

  const handleDayChange = (e) => {
    const { name, value } = e.target;
    setDayData((prev) => ({
      ...prev,
      [name]: name === "dayNumber" ? Number(value) : value,
    }));
  };

  const handleCreateClick = () => {
    setFormData({ name: "", monthNumber: 1, year: 2024 });
    setIsCreating(true);
  };

  const handleEditClick = (month) => {
    setFormData({
      name: month.name,
      monthNumber: month.monthNumber,
      year: month.year,
    });
    setIsEditing(month._id);
  };

  const handleGenerateDatesClick = (monthId) => {
    const month = months.find((m) => m._id === monthId);
    if (month) {
      const monthDate = new Date(month.year, month.monthNumber - 1, 1);
      setCurrentDate(monthDate);

      const existingDates = [];
      if (month.weeks) {
        month.weeks.forEach((week) => {
          if (week.days) {
            week.days.forEach((day) => {
              existingDates.push(new Date(day.date));
            });
          }
        });
      }

      setSelectedDates(existingDates);
      setIsGeneratingDates(monthId);
    }
  };

  const handleAddWeekClick = (monthId) => {
    setWeekData({ weekNumber: 1, startDate: "", endDate: "" });
    setIsManagingWeek(monthId);
  };

  const handleAddDayClick = (monthId, weekId) => {
    setDayData({ weekId, dayNumber: 1, date: "" });
    setIsManagingDay(monthId);
  };

  const closeModal = () => {
    setIsCreating(false);
    setIsEditing(null);
    setIsAddingWeek(null);
    setIsGeneratingDates(null);
    setIsManagingWeek(null);
    setIsManagingDay(null);
    setSelectedWeekId("");
    setAvailableWeeks([]);
    setSelectedDates([]);
    setWeekData({ weekNumber: 1, startDate: "", endDate: "" });
    setDayData({ weekId: "", dayNumber: 1, date: "" });
    setIsDragging(false);
    setDragStartDate(null);
    setDragPreview([]);
    setDragMode("select");
    setMouseDownTime(null);
    setHasDraggedDistance(false);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const newMonth = await postData("/months", formData);
      await fetchMonths();
      setIsCreating(false);
      setFormData({ name: "", monthNumber: 1, year: 2024 });
    } catch (err) {
      setError("Failed to create month.");
      console.error(err);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await putData(`/months/${isEditing}`, formData);

      await cleanupEmptyWeeks(isEditing);

      await fetchMonths();
      setIsEditing(null);
    } catch (err) {
      setError("Failed to update month.");
      console.error(err);
    }
  };

  const cleanupEmptyWeeks = async (monthId) => {
    try {
      const response = await getData(`/months/${monthId}`);
      if (response.success && response.data) {
        const month = response.data;

        const emptyWeekIds = [];
        if (month.weeks && month.weeks.length > 0) {
          month.weeks.forEach((week) => {
            if (!week.days || week.days.length === 0) {
              emptyWeekIds.push(week._id);
            }
          });
        }

        if (emptyWeekIds.length > 0) {
          console.log(
            `Found ${emptyWeekIds.length} empty weeks to delete:`,
            emptyWeekIds
          );

          for (const weekId of emptyWeekIds) {
            try {
              await deleteData(`weeks/${weekId}`);
              console.log(`Deleted empty week: ${weekId}`);
            } catch (weekError) {
              console.error(`Error deleting empty week ${weekId}:`, weekError);
            }
          }
        }
      }
    } catch (cleanupError) {
      console.error("Error during empty week cleanup:", cleanupError);
    }
  };

  const handleGenerateDatesSubmit = async () => {
    if (selectedDates.length === 0) {
      setError("Please select at least one date.");
      return;
    }

    try {
      const month = months.find((m) => m._id === isGeneratingDates);

      const existingDates = [];
      if (month?.weeks) {
        month.weeks.forEach((week) => {
          if (week.days) {
            week.days.forEach((day) => {
              existingDates.push(new Date(day.date));
            });
          }
        });
      }

      const datesToRemove = existingDates.filter(
        (existingDate) =>
          !selectedDates.some(
            (selectedDate) =>
              selectedDate.toDateString() === existingDate.toDateString()
          )
      );

      // Remove unselected dates first
      if (datesToRemove.length > 0) {
        const dayIdsToRemove = [];
        const weekDayPairs = [];

        if (month?.weeks) {
          month.weeks.forEach((week) => {
            if (week.days) {
              week.days.forEach((day) => {
                const dayDate = new Date(day.date);
                if (
                  datesToRemove.some(
                    (removeDate) =>
                      removeDate.toDateString() === dayDate.toDateString()
                  )
                ) {
                  dayIdsToRemove.push(day._id);
                  weekDayPairs.push({ weekId: week._id, dayId: day._id });
                }
              });
            }
          });
        }

        for (const pair of weekDayPairs) {
          try {
            await deleteData(`days/${pair.dayId}`);
          } catch (deleteError) {
            console.error("Error removing day:", deleteError);
          }
        }

        await cleanupEmptyWeeks(isGeneratingDates);
      }

      // Always resend all selected dates (both new and existing ones)
      if (selectedDates.length > 0) {
        const dates = selectedDates.map(formatDateForAPI);
        await postData("/months/generate-weeks-days", {
          monthId: isGeneratingDates,
          dates,
        });
      }

      await fetchMonths();
      setIsGeneratingDates(null);
      setSelectedDates([]);
    } catch (err) {
      setError("Failed to update training dates.");
      console.error(err);
    }
  };

  const handleAddWeekSubmit = async (e) => {
    e.preventDefault();
    try {
      await postData(`/months/${isManagingWeek}/add-week`, weekData);

      await cleanupEmptyWeeks(isManagingWeek);

      await fetchMonths();
      setIsManagingWeek(null);
    } catch (err) {
      setError("Failed to add week.");
      console.error(err);
    }
  };

  const handleAddDaySubmit = async (e) => {
    e.preventDefault();
    try {
      await postData(`/months/${isManagingDay}/add-day`, dayData);

      await cleanupEmptyWeeks(isManagingDay);

      await fetchMonths();
      setIsManagingDay(null);
    } catch (err) {
      setError("Failed to add day.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this month? This will also delete all weeks and days in this month."
      )
    )
      return;

    try {
      const month = months.find((m) => m._id === id);

      if (month?.weeks && month.weeks.length > 0) {
        const allDayIds = [];
        const allWeekIds = [];

        month.weeks.forEach((week) => {
          allWeekIds.push(week._id);
          if (week.days && week.days.length > 0) {
            week.days.forEach((day) => {
              allDayIds.push(day._id);
            });
          }
        });

        console.log(
          `Deleting month ${id} with ${allWeekIds.length} weeks and ${allDayIds.length} days`
        );

        for (const dayId of allDayIds) {
          try {
            await deleteData(`days/${dayId}`);
          } catch (dayError) {
            console.error(`Error deleting day ${dayId}:`, dayError);
          }
        }

        for (const weekId of allWeekIds) {
          try {
            await deleteData(`weeks/${weekId}`);
          } catch (weekError) {
            console.error(`Error deleting week ${weekId}:`, weekError);
          }
        }
      }

      await deleteData(`/months/${id}`);
      await fetchMonths();
    } catch (err) {
      setError("Failed to delete month: " + err.message);
      console.error(err);
    }
  };

  const handleRemoveDay = async (monthId, weekId, dayId) => {
    if (!confirm("Are you sure you want to delete this day?")) return;

    try {
      const month = months.find((m) => m._id === monthId);
      const week = month?.weeks?.find((w) => w._id === weekId);
      const dayCountInWeek = week?.days?.length || 0;

      await deleteData(`days/${dayId}`);

      if (dayCountInWeek <= 1) {
        try {
          console.log(`Deleting empty week: ${weekId}`);
          await deleteData(`weeks/${weekId}`);
        } catch (weekDeleteError) {
          console.error("Error removing empty week:", weekDeleteError);
        }
      }

      await fetchMonths();
    } catch (err) {
      setError("Failed to remove day: " + err.message);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Loading training months...
          </p>
        </div>
      </div>
    );
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Training Months
            </h1>
            <p className="text-slate-600">
              Manage your training schedule and calendar
            </p>
          </div>
          <button
            onClick={handleCreateClick}
            className="group bg-slate-700 hover:bg-slate-800 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Month
            </span>
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl relative animate-fadeIn">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-3 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
            <button
              onClick={() => setError("")}
              className="absolute top-2 right-2 p-2 hover:bg-red-100 rounded-lg transition-colors duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/80 backdrop-blur-sm">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 tracking-wider">
                    Training Month
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {months.length === 0 ? (
                  <tr>
                    <td  className="px-8 py-12 text-center">
                      <div className="text-slate-400">
                        <svg
                          className="w-12 h-12 mx-auto mb-4 opacity-40"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-lg font-medium">
                          No training months found
                        </p>
                        <p className="text-sm mt-1">
                          Create your first training month to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  months.map((month, index) => (
                    <>
                      <tr
                        key={month._id}
                        className="group hover:bg-slate-50/50 transition-all duration-300 animate-fadeInUp"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center">
                            {month.weeks && month.weeks.length > 0 && (
                              <button
                                onClick={() => toggleMonth(month._id)}
                                className="mr-4 p-2 rounded-lg hover:bg-slate-100 transition-all duration-200 group/btn"
                              >
                                <svg
                                  className={`w-5 h-5 text-slate-400 group-hover/btn:text-slate-600 transition-all duration-300 ${
                                    expandedMonths.has(month._id)
                                      ? "rotate-90"
                                      : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                            )}
                            <div>
                              <h3 className="text-lg font-semibold text-slate-800 group-hover:text-slate-900 transition-colors duration-200">
                                {month.name}
                              </h3>
                              <p className="text-sm text-slate-500 mt-1">
                                {monthNames[month.monthNumber - 1]} {month.year}
                                {month.weeks && (
                                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-600">
                                    {month.weeks.length} weeks
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(month)}
                              className="group/edit p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-105"
                              title="Edit month"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() =>
                                handleGenerateDatesClick(month._id)
                              }
                              className="group/calendar p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 transform hover:scale-105"
                              title="Manage training dates"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(month._id)}
                              className="group/delete p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-105"
                              title="Delete month"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedMonths.has(month._id) &&
                        month.weeks?.map((week, weekIndex) => (
                          <>
                            <tr
                              key={`week-${week._id}`}
                              className="bg-blue-50/30 animate-slideDown"
                              style={{ animationDelay: `${weekIndex * 30}ms` }}
                            >
                              <td className="px-8 py-4">
                                <div className="flex items-center pl-12">
                                  {week.days && week.days.length > 0 && (
                                    <button
                                      onClick={() => toggleWeek(week._id)}
                                      className="mr-3 p-1.5 rounded-lg hover:bg-blue-100 transition-all duration-200"
                                    >
                                      <svg
                                        className={`w-4 h-4 text-blue-500 transition-transform duration-300 ${
                                          expandedWeeks.has(week._id)
                                            ? "rotate-90"
                                            : ""
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 5l7 7-7 7"
                                        />
                                      </svg>
                                    </button>
                                  )}
                                  <div>
                                    <h4 className="font-medium text-slate-700">
                                      Week {week.weekNumber}
                                    </h4>
                                    <p className="text-sm text-slate-500">
                                      {new Date(
                                        week.startDate
                                      ).toLocaleDateString()}{" "}
                                      -{" "}
                                      {new Date(
                                        week.endDate
                                      ).toLocaleDateString()}
                                      <span className="ml-2 text-blue-600 font-medium">
                                        {week.days?.length || 0} days
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {expandedWeeks.has(week._id) &&
                              week.days?.map((day, dayIndex) => (
                                <tr
                                  key={`day-${day._id}`}
                                  className="bg-emerald-50/30 animate-slideDown"
                                  style={{
                                    animationDelay: `${dayIndex * 20}ms`,
                                  }}
                                >
                                  <td className="px-8 py-3">
                                    <div className="pl-20">
                                      <div className="flex items-center">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                                        <div>
                                          <h5 className="font-medium text-slate-700">
                                            Day {day.dayNumber}
                                          </h5>
                                          <p className="text-sm text-slate-500">
                                            {new Date(
                                              day.date
                                            ).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </>
                        ))}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isCreating && (
        <Modal
          title="Create New Month"
          onClose={closeModal}
          onSubmit={handleCreateSubmit}
        >
          <FormFields formData={formData} onChange={handleChange} />
        </Modal>
      )}

      {isEditing && (
        <Modal
          title="Edit Month"
          onClose={closeModal}
          onSubmit={handleUpdateSubmit}
        >
          <FormFields formData={formData} onChange={handleChange} />
        </Modal>
      )}

      {isGeneratingDates && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg w-full max-w-md p-4 max-h-[90vh] overflow-y-auto transform animate-slideUp">
            <div className="flex items-end justify-end  text-right mb-4">
              {/* <h2 className="text-lg font-bold text-slate-800">Select Training Dates</h2> */}
              <button
                onClick={closeModal}
                className="p-1 hover:bg-slate-100 rounded border  transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <h3 className="text-sm font-semibold text-slate-700 text-center mb-1">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              {/* <p className="text-xs text-slate-500 text-center">
                Click individual dates or drag to select/deselect multiple dates at once
              </p> */}
            </div>

            <div
              className="grid grid-cols-7 gap-1 mb-4"
              onMouseUp={() => handleMouseUp(null)}
              onMouseLeave={() => handleMouseUp(null)}
            >
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-slate-500 py-2"
                >
                  {day}
                </div>
              ))}

              {getDaysInMonth(currentDate).map((date, index) => (
                <div key={index} className="aspect-square">
                  {date && isDateInSelectedMonth(date) && (
                    <button
                      onMouseDown={() => handleMouseDown(date)}
                      onMouseEnter={() => handleMouseEnter(date)}
                      onMouseUp={() => handleMouseUp(date)}
                      className={`w-full h-full text-xs rounded-lg transition-all duration-200 relative select-none font-medium transform hover:scale-105 ${(() => {
                        const previewState = getDatePreviewState(date);
                        const isSelected = isDateSelected(date);

                        if (previewState === "will-select") {
                          return "bg-slate-400 text-white";
                        } else if (previewState === "will-deselect") {
                          return "bg-red-400 text-white";
                        } else if (previewState === "already-selected") {
                          return "bg-slate-700 text-white";
                        } else if (previewState === "already-deselected") {
                          return "bg-slate-100 text-slate-400";
                        } else if (isSelected) {
                          return "bg-slate-700 text-white hover:bg-slate-800";
                        } else {
                          return "hover:bg-slate-100 text-slate-700";
                        }
                      })()}`}
                      style={{ userSelect: "none" }}
                    >
                      {date.getDate()}
                      {isDateExisting(date) && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"></div>
                      )}
                    </button>
                  )}
                  {date && !isDateInSelectedMonth(date) && (
                    <div className="w-full h-full text-xs text-slate-300 flex items-center justify-center">
                      {date.getDate()}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* {selectedDates.length > 0 && (
              <div className="mb-4 p-3 bg-slate-50 rounded-lg animate-fadeIn">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  Selected Dates ({selectedDates.length}):
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {selectedDates.map((date, index) => {
                    const isExisting = isDateExisting(date);
                    return (
                      <span
                        key={index}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded font-medium transition-all duration-200 ${
                          isExisting 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isExisting && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
                        {date.getDate()}/{date.getMonth() + 1}
                      </span>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Existing training days</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span>New training days</span>
                  </div>
                </div>
              </div>
            )} */}

            {(() => {
              const month = months.find((m) => m._id === isGeneratingDates);
              const existingDates = [];
              if (month?.weeks) {
                month.weeks.forEach((week) => {
                  if (week.days) {
                    week.days.forEach((day) => {
                      existingDates.push(new Date(day.date));
                    });
                  }
                });
              }

              const datesToAdd = selectedDates.filter(
                (selectedDate) =>
                  !existingDates.some(
                    (existingDate) =>
                      existingDate.toDateString() ===
                      selectedDate.toDateString()
                  )
              );

              const datesToRemove = existingDates.filter(
                (existingDate) =>
                  !selectedDates.some(
                    (selectedDate) =>
                      selectedDate.toDateString() ===
                      existingDate.toDateString()
                  )
              );
              return null;
            })()}

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all duration-200 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateDatesSubmit}
                disabled={selectedDates.length === 0}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm transform hover:-translate-y-0.5"
              >
                Update Training Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {isManagingWeek && (
        <Modal
          title="Add Week to Month"
          onClose={closeModal}
          onSubmit={handleAddWeekSubmit}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Week Number
              </label>
              <input
                type="number"
                name="weekNumber"
                value={weekData.weekNumber}
                onChange={handleWeekChange}
                required
                min="1"
                max="53"
                className="w-full border border-slate-200 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={weekData.startDate}
                onChange={handleWeekChange}
                required
                className="w-full border border-slate-200 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={weekData.endDate}
                onChange={handleWeekChange}
                required
                className="w-full border border-slate-200 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200"
              />
            </div>
          </div>
        </Modal>
      )}

      {isManagingDay && (
        <Modal
          title="Add Day to Week"
          onClose={closeModal}
          onSubmit={handleAddDaySubmit}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Day Number
              </label>
              <input
                type="number"
                name="dayNumber"
                value={dayData.dayNumber}
                onChange={handleDayChange}
                required
                min="1"
                max="31"
                className="w-full border border-slate-200 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={dayData.date}
                onChange={handleDayChange}
                required
                className="w-full border border-slate-200 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200"
              />
            </div>
          </div>
        </Modal>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

function Modal({ title, onClose, onSubmit, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg w-full max-w-sm p-4 mx-4 transform animate-slideUp">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={onSubmit}>
          {children}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all duration-200 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-all duration-200 font-medium text-sm transform hover:-translate-y-0.5"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormFields({ formData, onChange }) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Training Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
          required
          placeholder="e.g., March Advanced Training"
          className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Month
        </label>
        <select
          name="monthNumber"
          value={formData.monthNumber}
          onChange={onChange}
          className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-sm"
        >
          {monthNames.map((month, index) => (
            <option key={index + 1} value={index + 1}>
              {month}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Year
        </label>
        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={onChange}
          required
          min="2000"
          max="2100"
          className="w-full border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-sm"
        />
      </div>
    </div>
  );
}
