"use client";

import { useState, useEffect } from "react";
import { getData, postData, putData, deleteData } from "../../libs/axios/server";
import { storage } from "../../libs/axios/firebaseConfig"; // Import your firebase config
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchGroup, setSearchGroup] = useState("");

  // Image upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Month assignment states
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [monthsLoading, setMonthsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    groupName: "",
    email: "",
    code: "",
    imageUrl: "",
  });

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getData("/users");
        if (res?.success && Array.isArray(res.data)) {
          setUsers(res.data);
          setAllUsers(res.data);
          setError("");
        } else {
          setUsers([]);
          setAllUsers([]);
          setError("Invalid data received. Backend may still be starting.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load users. Server may be starting up...");
        setUsers([]);
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size should be less than 5MB");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        return;
      }

      setSelectedImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(""); // Clear any previous errors
    }
  };

  // Upload image to Firebase
  const uploadImageToFirebase = async (file, userId = null) => {
    if (!file) return null;

    setIsUploading(true);
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `users/${userId || 'temp'}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, filename);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  // Clear image selection
  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview("");
    setFormData(prev => ({ ...prev, imageUrl: "" }));
  };

  // Handle checkbox selection
  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  };

  // Open month assignment modal
  const openMonthModal = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one user to assign to a month.");
      return;
    }

    setIsMonthModalOpen(true);
    setMonthsLoading(true);
    setError("");

    try {
      const res = await getData("/months");
      if (res?.success && Array.isArray(res.data)) {
        setMonths(res.data);
      } else {
        setMonths([]);
        setError("Failed to load months.");
      }
    } catch (err) {
      console.error("Months fetch error:", err);
      setError("Failed to load months.");
      setMonths([]);
    } finally {
      setMonthsLoading(false);
    }
  };

  // Close month modal
  const closeMonthModal = () => {
    setIsMonthModalOpen(false);
    setSelectedMonth("");
    setMonths([]);
  };

  // Handle month assignment
  const handleAssignToMonth = async () => {
    if (!selectedMonth) {
      setError("Please select a month.");
      return;
    }

    try {
      const res = await postData(`/months/${selectedMonth}/assign-users`, {
        userIds: selectedUsers
      });

      if (res?.success) {
        setSelectedUsers([]);
        closeMonthModal();
        setError("");
        console.log("Users assigned successfully");
      } else {
        setError("Failed to assign users to month.");
      }
    } catch (err) {
      console.error("Assignment error:", err);
      setError("Failed to assign users to month.");
    }
  };

  // Search users by group
  const handleSearchByGroup = async () => {
    if (!searchGroup.trim()) {
      setError("Please enter a group name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await getData(`/users/group/${encodeURIComponent(searchGroup.trim())}`);
      if (res?.success && Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
        setError("No users found in this group or invalid response.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search users by group.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset search
  const resetSearch = () => {
    setSearchGroup("");
    setUsers(allUsers);
    setError("");
    setSelectedUsers([]);
  };

  // Open modals
  const openCreateModal = () => {
    setFormData({ name: "", groupName: "", email: "", code: "", imageUrl: "" });
    clearImageSelection();
    setIsCreating(true);
  };

  const openEditModal = (user) => {
    setFormData({
      name: user.name || "",
      groupName: user.groupName || "",
      email: user.email || "",
      code: user.code || "",
      imageUrl: user.imageUrl?.trim() || "",
    });
    clearImageSelection();
    // Set preview for existing image
    if (user.imageUrl?.trim()) {
      setImagePreview(user.imageUrl);
    }
    setIsEditing(user._id);
  };

  const closeModals = () => {
    setIsCreating(false);
    setIsEditing(null);
    setIsDeleting(null);
    clearImageSelection();
  };

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      let imageUrl = formData.imageUrl;
      
      // Upload image if selected
      if (selectedImage) {
        try {
          imageUrl = await uploadImageToFirebase(selectedImage);
        } catch (uploadError) {
          setError("Failed to upload image. Please try again.");
          return;
        }
      }

      const userData = {
        ...formData,
        imageUrl: imageUrl || ""
      };

      const newUser = await postData("/users", userData);
      if (!newUser?.data?._id) throw new Error("Invalid response");
      
      setUsers((prev) => [...prev, newUser.data]);
      setAllUsers((prev) => [...prev, newUser.data]);
      setIsCreating(false);
      clearImageSelection();
    } catch (err) {
      console.error("Create error:", err);
      setError("Failed to create user. Server may be down.");
    }
  };

  // Handle Update Submit
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      let imageUrl = formData.imageUrl;
      
      // Upload new image if selected
      if (selectedImage) {
        try {
          imageUrl = await uploadImageToFirebase(selectedImage, isEditing);
        } catch (uploadError) {
          setError("Failed to upload image. Please try again.");
          return;
        }
      }

      const userData = {
        ...formData,
        imageUrl: imageUrl || ""
      };

      const updatedUser = await putData(`/users/${isEditing}`, userData);
      if (!updatedUser?.data?._id) throw new Error("Invalid response");
      
      setUsers((prev) =>
        prev.map((u) => (u._id === isEditing ? updatedUser.data : u))
      );
      setAllUsers((prev) =>
        prev.map((u) => (u._id === isEditing ? updatedUser.data : u))
      );
      setIsEditing(null);
      clearImageSelection();
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update user.");
    }
  };

  // Handle Delete
  const confirmDelete = async () => {
    if (!isDeleting) return;
    try {
      await deleteData(`/users/${isDeleting._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== isDeleting._id));
      setAllUsers((prev) => prev.filter((u) => u._id !== isDeleting._id));
      setSelectedUsers((prev) => prev.filter(id => id !== isDeleting._id));
      setIsDeleting(null);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete user.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Users</h1>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <p>{error}</p>
          <button onClick={() => setError("")} className="font-bold">
            ×
          </button>
        </div>
      )}

      {/* Search by Group */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Group Name
            </label>
            <input
              type="text"
              value={searchGroup}
              onChange={(e) => setSearchGroup(e.target.value)}
              placeholder="e.g., Development Team"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSearchByGroup}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Search
            </button>
            {searchGroup && (
              <button
                onClick={resetSearch}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mb-6">
        <div className="flex gap-3">
          {selectedUsers.length > 0 && (
            <button
              onClick={openMonthModal}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg shadow transition"
            >
              Add Month ({selectedUsers.length} selected)
            </button>
          )}
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition"
        >
          + Add User
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
          No users found.
          <p className="text-sm mt-1">
            {searchGroup
              ? "Try a different group name."
              : error
                ? "Server may still be starting."
                : "Click 'Add User' to get started."}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avatar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleUserSelect(user._id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => window.location.href = `/users/${user._id}`}>
                      <img
                        src={user.imageUrl?.trim() || "https://via.placeholder.com/40"}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border hover:opacity-80 transition"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer" onClick={() => window.location.href = `/users/${user._id}`}>
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.groupName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setIsDeleting(user)}
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
          title="Create User" 
          onClose={closeModals} 
          onSubmit={handleCreateSubmit}
          isSubmitting={isUploading}
        >
          <UserForm 
            formData={formData} 
            onChange={handleChange}
            onImageSelect={handleImageSelect}
            imagePreview={imagePreview}
            onClearImage={clearImageSelection}
            isUploading={isUploading}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <Modal 
          title="Edit User" 
          onClose={closeModals} 
          onSubmit={handleUpdateSubmit}
          isSubmitting={isUploading}
        >
          <UserForm 
            formData={formData} 
            onChange={handleChange}
            onImageSelect={handleImageSelect}
            imagePreview={imagePreview}
            onClearImage={clearImageSelection}
            isUploading={isUploading}
          />
        </Modal>
      )}

      {/* Delete Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Delete user <strong>"{isDeleting.name}"</strong>? This cannot be undone.
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

      {/* Month Assignment Modal */}
      {isMonthModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Assign Users to Month</h2>
            <p className="text-gray-600 mb-4">
              Selected users: <strong>{selectedUsers.length}</strong>
            </p>
            
            {monthsLoading ? (
              <div className="text-center py-4">Loading months...</div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                <p className="text-sm font-medium text-gray-700 mb-2">Select a month:</p>
                {months.map((month) => (
                  <label key={month._id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="selectedMonth"
                      value={month._id}
                      checked={selectedMonth === month._id}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{month.name}</div>
                      <div className="text-xs text-gray-500">
                        Month {month.monthNumber} - {month.year} 
                        {month.assignedUsers && month.assignedUsers.length > 0 && 
                          ` (${month.assignedUsers.length} users assigned)`
                        }
                      </div>
                    </div>
                  </label>
                ))}
                {months.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No months available</p>
                )}
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeMonthModal}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignToMonth}
                disabled={!selectedMonth || monthsLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Modal
function Modal({ title, onClose, onSubmit, children, isSubmitting = false }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form onSubmit={onSubmit}>
          {children}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSubmitting ? "Uploading..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable Form with Image Upload
function UserForm({ formData, onChange, onImageSelect, imagePreview, onClearImage, isUploading }) {
  return (
    <div className="space-y-4">
      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Image
        </label>
        
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 flex justify-center">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={onClearImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        {/* File Input */}
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={onImageSelect}
              disabled={isUploading}
            />
          </label>
        </div>
        
        {isUploading && (
          <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading image...
          </p>
        )}
      </div>

      {/* Text Fields */}
      {["name", "groupName", "email", "code"].map((field) => (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700">
            {field === "groupName"
              ? "Group Name"
              : field === "email"
                ? "Email"
                : field === "code"
                  ? "Code"
                  : "Name"}
          </label>
          <input
            type={field === "email" ? "email" : "text"}
            name={field}
            value={formData[field]}
            onChange={onChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
      
      {/* Image URL Field (Alternative to file upload) */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Or Image URL (optional)
        </label>
        <input
          type="url"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={onChange}
          placeholder="https://example.com/avatar.jpg"
          className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          You can either upload an image above or provide an image URL here
        </p>
      </div>
    </div>
  );
}