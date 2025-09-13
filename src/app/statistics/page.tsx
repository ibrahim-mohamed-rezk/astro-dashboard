"use client";

import { useState, useEffect } from "react";
import {
  getData,
  postData,
  putData,
  deleteData,
} from "../../libs/axios/server";

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);

  // Add all fields: title_en, title_ar, count, description_en, description_ar
  const [formData, setFormData] = useState({
    title_en: "",
    title_ar: "",
    count: "",
    description_en: "",
    description_ar: "",
  });

  // Fetch all statistics on mount
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const res = await getData("/statistics");
        if (res?.success && Array.isArray(res.data)) {
          setStatistics(res.data);
          setError("");
        } else {
          setStatistics([]);
          setError("Invalid data received. Backend may still be starting.");
        }
      } catch (err) {
        setError("Failed to load statistics. Server may be starting up...");
        setStatistics([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStatistics();
  }, []);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setFormData({
      title_en: "",
      title_ar: "",
      count: "",
      description_en: "",
      description_ar: "",
    });
    setIsCreating(true);
  };

  const openEditModal = (stat) => {
    setFormData({
      title_en: stat.title_en || "",
      title_ar: stat.title_ar || "",
      count: stat.count || "",
      description_en: stat.description_en || "",
      description_ar: stat.description_ar || "",
    });
    setIsEditing(stat._id);
  };

  const closeModals = () => {
    setIsCreating(false);
    setIsEditing(null);
    setIsDeleting(null);
    setFormData({
      title_en: "",
      title_ar: "",
      count: "",
      description_en: "",
      description_ar: "",
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await postData("/statistics", formData);
      if (!res?.data?._id) throw new Error("Invalid response");
      setStatistics((prev) => [...prev, res.data]);
      setIsCreating(false);
      setFormData({
        title_en: "",
        title_ar: "",
        count: "",
        description_en: "",
        description_ar: "",
      });
    } catch (err) {
      setError("Failed to create statistic.");
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await putData(`/statistics/${isEditing}`, formData);
      if (!res?.data?._id) throw new Error("Invalid response");
      setStatistics((prev) =>
        prev.map((s) => (s._id === isEditing ? res.data : s))
      );
      setIsEditing(null);
      setFormData({
        title_en: "",
        title_ar: "",
        count: "",
        description_en: "",
        description_ar: "",
      });
    } catch (err) {
      setError("Failed to update statistic.");
    }
  };

  const confirmDelete = async () => {
    if (!isDeleting) return;
    try {
      await deleteData(`/statistics/${isDeleting._id}`);
      setStatistics((prev) => prev.filter((s) => s._id !== isDeleting._id));
      setIsDeleting(null);
    } catch (err) {
      setError("Failed to delete statistic.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Statistics</h1>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <p>{error}</p>
          <button onClick={() => setError("")} className="font-bold">
            ×
          </button>
        </div>
      )}

      <div className="flex justify-end mb-6">
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition"
        >
          + Add Statistic
        </button>
      </div>

      {loading ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          Loading statistics...
        </div>
      ) : statistics.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
          No statistics found.
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title in En
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title in Ar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description in En
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description in Ar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statistics.map((stat) => (
                  <tr key={stat._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.title_en}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.title_ar}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {stat.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {stat.description_en}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {stat.description_ar}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEditModal(stat)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setIsDeleting(stat)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreating && (
        <Modal
          title="Create Statistic"
          onClose={closeModals}
          onSubmit={handleCreateSubmit}
        >
          <StatisticForm formData={formData} onChange={handleChange} />
        </Modal>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <Modal
          title="Edit Statistic"
          onClose={closeModals}
          onSubmit={handleUpdateSubmit}
        >
          <StatisticForm formData={formData} onChange={handleChange} />
        </Modal>
      )}

      {/* Delete Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-6">
              Delete statistic{" "}
              <strong>"{isDeleting.title_en || isDeleting.title_ar}"</strong>?
              This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModals}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Modal
function Modal({ title, onClose, onSubmit, children }) {
  return (
    <div className="fixed inset-0 bg-[#000000b2] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
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

// Reusable Statistic Form
function StatisticForm({ formData, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title (English)</label>
        <input
          type="text"
          name="title_en"
          value={formData.title_en}
          onChange={onChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Title (Arabic)</label>
        <input
          type="text"
          name="title_ar"
          value={formData.title_ar}
          onChange={onChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          dir="rtl"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Value</label>
        <input
          type="number"
          name="count"
          value={formData.count}
          onChange={onChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description (English)
        </label>
        <textarea
          name="description_en"
          value={formData.description_en}
          onChange={onChange}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description (Arabic)
        </label>
        <textarea
          name="description_ar"
          value={formData.description_ar}
          onChange={onChange}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          dir="rtl"
        />
      </div>
    </div>
  );
}
