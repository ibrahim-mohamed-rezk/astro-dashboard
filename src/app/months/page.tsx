"use client";

import { useState, useEffect } from "react";
import { getData, postData, putData, deleteData } from "../../libs/axios/server";

export default function MonthsPage() {
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dropdown states
  const [expandedMonths, setExpandedMonths] = useState(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState(new Set());

  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [isAddingWeek, setIsAddingWeek] = useState(null);
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedWeekId, setSelectedWeekId] = useState("");
  const [weekLoading, setWeekLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    monthNumber: 1,
    year: 2024,
  });

  useEffect(() => {
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

    fetchMonths();
  }, []);

  // Toggle month expansion
  const toggleMonth = (monthId) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthId)) {
      newExpanded.delete(monthId);
      // Also collapse all weeks in this month
      const newExpandedWeeks = new Set(expandedWeeks);
      const month = months.find(m => m._id === monthId);
      month?.weeks?.forEach(week => {
        newExpandedWeeks.delete(week._id);
      });
      setExpandedWeeks(newExpandedWeeks);
    } else {
      newExpanded.add(monthId);
    }
    setExpandedMonths(newExpanded);
  };

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

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "monthNumber" || name === "year" ? Number(value) : value,
    }));
  };

  // Open create form
  const handleCreateClick = () => {
    setFormData({ name: "", monthNumber: 1, year: 2024 });
    setIsCreating(true);
  };

  // Open edit modal
  const handleEditClick = (month) => {
    setFormData({
      name: month.name,
      monthNumber: month.monthNumber,
      year: month.year,
    });
    setIsEditing(month._id);
  };

  // Open "Add Week" modal
  const handleAddWeekClick = async (monthId) => {
    setIsAddingWeek(monthId);
    setWeekLoading(true);
    setSelectedWeekId("");
    try {
      const res = await getData("/weeks");
      if (res.success) {
        setAvailableWeeks(res.data);
      } else {
        setError("Failed to load weeks.");
      }
    } catch (err) {
      console.error("Error fetching weeks:", err);
      setError("Failed to fetch weeks.");
    } finally {
      setWeekLoading(false);
    }
  };

  // Close modals
  const closeModal = () => {
    setIsCreating(false);
    setIsEditing(null);
    setIsAddingWeek(null);
    setSelectedWeekId("");
    setAvailableWeeks([]);
  };

  // Submit create
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const newMonth = await postData("/months", formData);
      setMonths((prev) => [...prev, newMonth.data]);
      setIsCreating(false);
      setFormData({ name: "", monthNumber: 1, year: 2024 });
    } catch (err) {
      setError("Failed to create month.");
      console.error(err);
    }
  };

  // Submit update
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedMonth = await putData(`/months/${isEditing}`, formData);
      setMonths((prev) =>
        prev.map((m) => (m._id === isEditing ? updatedMonth.data : m))
      );
      setIsEditing(null);
    } catch (err) {
      setError("Failed to update month.");
      console.error(err);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this month?")) return;

    try {
      await deleteData(`/months/${id}`);
      setMonths((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError("Failed to delete month.");
      console.error(err);
    }
  };

  // Handle add week to month
  const handleAddWeekSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWeekId) return;

    try {
      await postData(`/weeks/${selectedWeekId}/add-to-month`, {
        monthId: isAddingWeek,
      });

      // Refresh months to reflect updated weeks
      const res = await getData("/months");
      if (res.success) {
        setMonths(res.data);
      }

      setIsAddingWeek(null);
      setSelectedWeekId("");
    } catch (err) {
      console.error("Error adding week to month:", err);
      setError("Failed to add week to month.");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading months...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Training Months</h1>
        <button
          onClick={handleCreateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition"
        >
          + Add Month
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weeks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {months.length === 0 ? (
              <tr>
                <td  className="px-6 py-4 text-center text-gray-500">No months found.</td>
              </tr>
            ) : (
              months.map((month) => (
                <>
                  {/* Month Row */}
                  <tr key={month._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        {month.weeks && month.weeks.length > 0 && (
                          <button
                            onClick={() => toggleMonth(month._id)}
                            className="mr-2 text-gray-400 hover:text-gray-600"
                          >
                            {expandedMonths.has(month._id) ? (
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
                        {month.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Intl.DateTimeFormat("en-US", { month: "long" }).format(
                        new Date(2024, month.monthNumber - 1)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{month.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{month.weeks?.length || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{month.assignedUsers?.length || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(month.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditClick(month)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAddWeekClick(month._id)}
                        className="text-green-600 hover:text-green-900 ml-4"
                      >
                        Add Week
                      </button>
                      <button
                        onClick={() => handleDelete(month._id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>

                  {/* Weeks Rows (when month is expanded) */}
                  {expandedMonths.has(month._id) && month.weeks?.map((week) => (
                    <>
                      <tr key={`week-${week._id}`} className="bg-blue-50">
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center pl-8">
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
                            📅 Week {week.weekNumber}
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                          {new Date(week.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                          {new Date(week.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">{week.days?.length || 0} days</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">-</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(week.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                          {/* <button className="text-blue-600 hover:text-blue-900">Edit Week</button> */}
                        </td>
                      </tr>

                      {/* Days Rows (when week is expanded) */}
                      {expandedWeeks.has(week._id) && week.days?.map((day) => (
                        <tr key={`day-${day._id}`} className="bg-green-50">
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                            <div className="pl-16">
                              📆 Day {day.dayNumber}
                            </div>
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                            {new Date(day.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">-</td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">-</td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">{day.users?.length || 0} users</td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                            {new Date(day.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                            {/* <button className="text-purple-600 hover:text-purple-900">View Day</button> */}
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

      {/* Create Modal */}
      {isCreating && (
        <Modal title="Create New Month" onClose={closeModal} onSubmit={handleCreateSubmit}>
          <FormFields formData={formData} onChange={handleChange} />
        </Modal>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <Modal title="Edit Month" onClose={closeModal} onSubmit={handleUpdateSubmit}>
          <FormFields formData={formData} onChange={handleChange} />
        </Modal>
      )}

      {/* Add Week Modal */}
      {isAddingWeek && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add Week to Month</h2>

            <form onSubmit={handleAddWeekSubmit}>
              {weekLoading ? (
                <p className="text-gray-500">Loading weeks...</p>
              ) : availableWeeks.length === 0 ? (
                <p className="text-gray-500">No unassigned weeks available.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableWeeks.map((week) => (
                    <label
                      key={week._id}
                      className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="week"
                        value={week._id}
                        checked={selectedWeekId === week._id}
                        onChange={() => setSelectedWeekId(week._id)}
                        className="mr-3"
                      />
                      <div className="text-sm">
                        <strong>Week {week.weekNumber}</strong>:{" "}
                        {new Date(week.startDate).toLocaleDateString()} –{" "}
                        {new Date(week.endDate).toLocaleDateString()}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedWeekId || weekLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  Add Week
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Modal Component
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

// Reusable Form Fields
function FormFields({ formData, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Month</label>
        <select
          name="monthNumber"
          value={formData.monthNumber}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(2024, i))}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Year</label>
        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={onChange}
          required
          min="2000"
          max="2100"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}