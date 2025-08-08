"use client";

import { useState, useEffect } from "react";
import { getData, postData, putData, deleteData } from "../../libs/axios/server";

export default function WeeksPage() {
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dropdown states
  const [expandedWeeks, setExpandedWeeks] = useState(new Set());

  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(null); // week ID being edited
  const [formData, setFormData] = useState({
    weekNumber: 1,
    startDate: "",
    endDate: "",
  });

  // Add Day Modal States
  const [isAddingDay, setIsAddingDay] = useState(null); // weekId when adding day
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedDayId, setSelectedDayId] = useState("");
  const [dayLoading, setDayLoading] = useState(false);

  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        const res = await getData("/weeks");
        if (res.success) {
          setWeeks(res.data);
        } else {
          setError(res.message || "Failed to load weeks.");
        }
      } catch (err) {
        console.error("Error fetching weeks:", err);
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeeks();
  }, []);

  // Toggle week expansion
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
      [name]: name === "weekNumber" ? Number(value) : value,
    }));
  };

  const handleCreateClick = () => {
    setFormData({
      weekNumber: 1,
      startDate: "",
      endDate: "",
    });
    setIsCreating(true);
  };

  const handleEditClick = (week) => {
    setFormData({
      weekNumber: week.weekNumber,
      startDate: week.startDate.split("T")[0],
      endDate: week.endDate.split("T")[0],
    });
    setIsEditing(week._id);
  };

  const closeModal = () => {
    setIsCreating(false);
    setIsEditing(null);
  };

  const closeAddDayModal = () => {
    setIsAddingDay(null);
    setSelectedDayId("");
    setAvailableDays([]);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const newWeek = await postData("/weeks", formData);
      setWeeks((prev) => [...prev, newWeek.data]);
      setIsCreating(false);
      setFormData({ weekNumber: 1, startDate: "", endDate: "" });
    } catch (err) {
      setError("Failed to create week.");
      console.error(err);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedWeek = await putData(`/weeks/${isEditing}`, formData);
      setWeeks((prev) =>
        prev.map((w) => (w._id === isEditing ? updatedWeek.data : w))
      );
      setIsEditing(null);
    } catch (err) {
      setError("Failed to update week.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this week?")) return;

    try {
      await deleteData(`/weeks/${id}`);
      setWeeks((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      setError("Failed to delete week.");
      console.error(err);
    }
  };

  // Handle "Add Day" click
  const handleAddDayClick = async (weekId) => {
    setIsAddingDay(weekId);
    setDayLoading(true);
    setSelectedDayId("");
    try {
      const res = await getData("/days"); // Fetch all days
      if (res.success) {
        const currentWeek = weeks.find((w) => w._id === weekId);
        const assignedDayIds = currentWeek?.days?.map((d) => d._id) || [];

        // Filter out already assigned days
        const unassignedDays = res.data.filter((day) => !assignedDayIds.includes(day._id));
        setAvailableDays(unassignedDays);
      } else {
        setError("Failed to load days.");
      }
    } catch (err) {
      console.error("Error fetching days:", err);
      setError("Failed to fetch days.");
    } finally {
      setDayLoading(false);
    }
  };

  // Submit: Add Day to Week
  const handleAddDaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedDayId || !isAddingDay) return;

    try {
      await postData(`/days/${selectedDayId}/add-to-week`, {
        weekId: isAddingDay,
      });

      // Refresh weeks to reflect updated days
      const res = await getData("/weeks");
      if (res.success) {
        setWeeks(res.data);
      }

      closeAddDayModal();
    } catch (err) {
      console.error("Error adding day to week:", err);
      setError("Failed to add day to week.");
    }
  };

  // Get rating color based on score
  const getRatingColor = (score) => {
    if (score >= 8) return "text-green-600 bg-green-100";
    if (score >= 6) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  if (loading) {
    return <div className="p-6 text-center">Loading weeks...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Training Weeks</h1>
        <button
          onClick={handleCreateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition"
        >
          + Add Week
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Week #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Days Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {weeks.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No weeks found.
                </td>
              </tr>
            ) : (
              weeks.map((week) => (
                <>
                  {/* Week Row */}
                  <tr key={week._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        {week.days && week.days.length > 0 && (
                          <button
                            onClick={() => toggleWeek(week._id)}
                            className="mr-2 text-gray-400 hover:text-gray-600"
                          >
                            {expandedWeeks.has(week._id) ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </button>
                        )}
                        Week {week.weekNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(week.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(week.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {week.days?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(week.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditClick(week)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAddDayClick(week._id)}
                        className="text-green-600 hover:text-green-900 ml-4"
                      >
                        Add Day
                      </button>
                      <button
                        onClick={() => handleDelete(week._id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>

                  {/* Days Data (when week is expanded) */}
                  {expandedWeeks.has(week._id) && week.days?.map((day) => (
                    <tr key={`day-${day._id}`} className="bg-blue-50">
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                        <div className="pl-8">
                          📅 Day {day.dayNumber}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                        {new Date(day.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">-</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">{day.users?.length || 0} users</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(day.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                        {/* <button className="text-blue-600 hover:text-blue-900">Edit Day</button> */}
                      </td>
                    </tr>
                  ))}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <Modal title="Create Week" onClose={closeModal} onSubmit={handleCreateSubmit}>
          <WeekForm formData={formData} onChange={handleChange} />
        </Modal>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <Modal title="Edit Week" onClose={closeModal} onSubmit={handleUpdateSubmit}>
          <WeekForm formData={formData} onChange={handleChange} />
        </Modal>
      )}

      {/* Add Day Modal */}
      {isAddingDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add Day to Week</h2>

            <form onSubmit={handleAddDaySubmit}>
              {dayLoading ? (
                <p className="text-gray-500">Loading days...</p>
              ) : availableDays.length === 0 ? (
                <p className="text-gray-500">No unassigned days available.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableDays.map((day) => (
                    <label
                      key={day._id}
                      className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="day"
                        value={day._id}
                        checked={selectedDayId === day._id}
                        onChange={() => setSelectedDayId(day._id)}
                        className="mr-3"
                      />
                      <div className="text-sm">
                        <strong>Day {day.dayNumber}</strong>
                        {day.date && (
                          <span className="text-gray-600 ml-2">
                            ({new Date(day.date).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeAddDayModal}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedDayId || dayLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  Add Day
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Modal
function Modal({ title, onClose, onSubmit, children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form onSubmit={onSubmit}>
          {children}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Form Fields Component
function WeekForm({ formData, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Week Number</label>
        <input
          type="number"
          name="weekNumber"
          value={formData.weekNumber}
          onChange={onChange}
          min="1"
          max="53"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Start Date</label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={onChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">End Date</label>
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={onChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}