"use client";

import { useState, useEffect } from "react";
import { getData, postData, putData, deleteData } from "../../libs/axios/server";

export default function BadgesPage() {
  const [badges, setBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]); // Store all badges for category extraction
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); // For filtering
  const [selectedStatus, setSelectedStatus] = useState(""); // For active/inactive filtering

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(null); // badge ID being edited
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "#FFD700",
    category: "",
    requirements: "",
    isActive: true,
  });

  useEffect(() => {
    const fetchAllBadges = async () => {
      try {
        setLoading(true);
        const res = await getData("/badges");
        if (res.success) {
          setAllBadges(res.data);
          // Extract unique categories from badges
          const categories = [...new Set(res.data.map(badge => badge.category).filter(cat => cat))];
          setAvailableCategories(categories.sort());
        } else {
          setError(res.message || "Failed to load badges.");
        }
      } catch (err) {
        console.error("Error fetching all badges:", err);
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllBadges();
  }, []);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        let endpoint = "/badges";
        if (selectedCategory) {
          endpoint = `/badges/category/${selectedCategory}`;
        }
        
        const res = await getData(endpoint);
        if (res.success) {
          setBadges(res.data);
        } else {
          setError(res.message || "Failed to load badges.");
        }
      } catch (err) {
        console.error("Error fetching badges:", err);
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    const applyFilters = () => {
      let filteredBadges = allBadges;

      // Apply category filter
      if (selectedCategory) {
        filteredBadges = filteredBadges.filter(badge => badge.category === selectedCategory);
      }

      // Apply status filter
      if (selectedStatus !== "") {
        const isActive = selectedStatus === "active";
        filteredBadges = filteredBadges.filter(badge => (badge.isActive !== false) === isActive);
      }

      setBadges(filteredBadges);
      setLoading(false);
    };

    if (selectedCategory === "" && selectedStatus === "") {
      // If no filters selected, use the already loaded all badges
      setBadges(allBadges);
      setLoading(false);
    } else if (selectedCategory && selectedStatus === "") {
      // Only category filter, use API endpoint
      fetchBadges();
    } else {
      // Status filter or both filters, apply client-side filtering
      applyFilters();
    }
  }, [selectedCategory, selectedStatus, allBadges]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
    setError(""); // Clear any previous errors
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
    setError(""); // Clear any previous errors
  };

  const handleCreateClick = () => {
    setFormData({
      name: "",
      description: "",
      icon: "",
      color: "#FFD700",
      category: "",
      requirements: "",
      isActive: true,
    });
    setIsCreating(true);
  };

  const handleEditClick = (badge) => {
    setFormData({
      name: badge.name || "",
      description: badge.description || "",
      icon: badge.icon || "",
      color: badge.color || "#FFD700",
      category: badge.category || "",
      requirements: badge.requirements || "",
      isActive: badge.isActive !== false, // Default to true if undefined
    });
    setIsEditing(badge._id);
  };

  const closeModal = () => {
    setIsCreating(false);
    setIsEditing(null);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const newBadge = await postData("/badges", formData);
      setBadges((prev) => [...prev, newBadge.data]);
      setAllBadges((prev) => [...prev, newBadge.data]);
      
      // Update available categories if new category is added
      if (newBadge.data.category && !availableCategories.includes(newBadge.data.category)) {
        setAvailableCategories(prev => [...prev, newBadge.data.category].sort());
      }
      
      setIsCreating(false);
      setFormData({
        name: "",
        description: "",
        icon: "",
        color: "#FFD700",
        category: "",
        requirements: "",
        isActive: true,
      });
    } catch (err) {
      setError("Failed to create badge.");
      console.error(err);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedBadge = await putData(`/badges/${isEditing}`, formData);
      setBadges((prev) =>
        prev.map((b) => (b._id === isEditing ? updatedBadge.data : b))
      );
      setAllBadges((prev) =>
        prev.map((b) => (b._id === isEditing ? updatedBadge.data : b))
      );
      
      // Update available categories if category changed
      const allCategories = [...new Set(allBadges.map(badge => 
        badge._id === isEditing ? updatedBadge.data.category : badge.category
      ).filter(cat => cat))];
      setAvailableCategories(allCategories.sort());
      
      setIsEditing(null);
    } catch (err) {
      setError("Failed to update badge.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this badge?")) return;

    try {
      await deleteData(`/badges/${id}`);
      setBadges((prev) => prev.filter((b) => b._id !== id));
      setAllBadges((prev) => prev.filter((b) => b._id !== id));
      
      // Update available categories after deletion
      const updatedAllBadges = allBadges.filter(b => b._id !== id);
      const categories = [...new Set(updatedAllBadges.map(badge => badge.category).filter(cat => cat))];
      setAvailableCategories(categories.sort());
    } catch (err) {
      setError("Failed to delete badge.");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading badges...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Badges Management</h1>
        <button
          onClick={handleCreateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition"
        >
          + Add Badge
        </button>
      </div>

      {/* Filter Section */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={selectedCategory}
              onChange={handleCategoryFilter}
              className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Categories</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={selectedStatus}
              onChange={handleStatusFilter}
              className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          {(selectedCategory || selectedStatus) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Showing:</span>
              {selectedStatus && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                </span>
              )}
              {selectedCategory && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                  {selectedCategory}
                </span>
              )}
            </div>
          )}
        </div>
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
                Badge
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requirements
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
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
            {badges.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No badges found.
                </td>
              </tr>
            ) : (
              badges.map((badge) => (
                <tr key={badge._id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3"
                        style={{ backgroundColor: badge.color || "#FFD700" }}
                      >
                        {badge.icon || "🏆"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{badge.name}</div>
                    <div className="text-sm text-gray-500">{badge.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                      {badge.category || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                    <div className="truncate" title={badge.requirements}>
                      {badge.requirements || "No requirements specified"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      badge.isActive !== false
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {badge.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {badge.createdAt ? new Date(badge.createdAt).toLocaleDateString() : "–"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditClick(badge)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(badge._id)}
                      className="text-red-600 hover:text-red-900 ml-4"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <Modal title="Create Badge" onClose={closeModal} onSubmit={handleCreateSubmit}>
          <BadgeForm formData={formData} onChange={handleChange} />
        </Modal>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <Modal title="Edit Badge" onClose={closeModal} onSubmit={handleUpdateSubmit}>
          <BadgeForm formData={formData} onChange={handleChange} />
        </Modal>
      )}
    </div>
  );
}

// Reusable Modal
function Modal({ title, onClose, onSubmit, children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
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
function BadgeForm({ formData, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Badge Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
          placeholder="e.g., Top Performer"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Describe what this badge represents..."
          rows={3}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Icon (Emoji)</label>
          <input
            type="text"
            name="icon"
            value={formData.icon}
            onChange={onChange}
            placeholder="🏆"
            maxLength={2}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Color</label>
          <input
            type="color"
            name="color"
            value={formData.color}
            onChange={onChange}
            className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={onChange}
          placeholder="e.g., performance, achievement, milestone"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Enter a category name (will be added to filter options)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Requirements</label>
        <textarea
          name="requirements"
          value={formData.requirements}
          onChange={onChange}
          placeholder="e.g., Score above 9 in performance for 5 consecutive days"
          rows={2}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Active (badge can be earned)
        </label>
      </div>
    </div>
  );
}