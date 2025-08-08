"use client";

import { useState, useEffect } from "react";
import { getData, postData, putData, deleteData } from "../../libs/axios/server";

export default function DaysPage() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(null); // day ID being edited
  const [formData, setFormData] = useState({
    dayNumber: 1,
    date: "",
  });

  useEffect(() => {
    const fetchDays = async () => {
      try {
        const res = await getData("/days");
        if (res.success) {
          setDays(res.data);
        } else {
          setError(res.message || "Failed to load days.");
        }
      } catch (err) {
        console.error("Error fetching days:", err);
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDays();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "dayNumber" ? Number(value) : value,
    }));
  };

  const handleCreateClick = () => {
    setFormData({ dayNumber: 1, date: "" });
    setIsCreating(true);
  };

  const handleEditClick = (day) => {
    setFormData({
      dayNumber: day.dayNumber,
      date: day.date.split("T")[0], // Convert ISO to YYYY-MM-DD
    });
    setIsEditing(day._id);
  };

  const closeModal = () => {
    setIsCreating(false);
    setIsEditing(null);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const newDay = await postData("/days", formData);
      setDays((prev) => [...prev, newDay.data]);
      setIsCreating(false);
      setFormData({ dayNumber: 1, date: "" });
    } catch (err) {
      setError("Failed to create day.");
      console.error(err);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedDay = await putData(`/days/${isEditing}`, formData);
      setDays((prev) =>
        prev.map((d) => (d._id === isEditing ? updatedDay.data : d))
      );
      setIsEditing(null);
    } catch (err) {
      setError("Failed to update day.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this day?")) return;

    try {
      await deleteData(`/days/${id}`);
      setDays((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      setError("Failed to delete day.");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading days...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Training Days</h1>
        <button
          onClick={handleCreateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition"
        >
          + Add Day
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
                Day #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Users Trained
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Performance
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
            {days.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No days found.
                </td>
              </tr>
            ) : (
              days.map((day) => {
                // Calculate average performance
                const ratings = day.users?.map(u => u.dailyRating) || [];
                const avgPerformance = ratings.length
                  ? (ratings.reduce((sum, r) => sum + r.performance, 0) / ratings.length).toFixed(1)
                  : "–";

                return (
                  <tr key={day._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Day {day.dayNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {day.users?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {avgPerformance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(day.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditClick(day)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(day._id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <Modal title="Create Day" onClose={closeModal} onSubmit={handleCreateSubmit}>
          <DayForm formData={formData} onChange={handleChange} />
        </Modal>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <Modal title="Edit Day" onClose={closeModal} onSubmit={handleUpdateSubmit}>
          <DayForm formData={formData} onChange={handleChange} />
        </Modal>
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

// Form Component
function DayForm({ formData, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Day Number</label>
        <input
          type="number"
          name="dayNumber"
          value={formData.dayNumber}
          onChange={onChange}
          min="1"
          max="31"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={onChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}