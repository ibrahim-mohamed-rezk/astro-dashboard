'use client';

import { useState, useEffect } from 'react';
import {
  getData,
  postData,
  putData,
  deleteData,
} from "../../../libs/axios/server";
import backendServer from "../../../libs/axios/server";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { storage } from "../../../libs/axios/firebaseConfig"; // Import your firebase config
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UserPage() {
  const params = useParams();
  const { id } = params;
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userEditModalOpen, setUserEditModalOpen] = useState(false);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [availableBadges, setAvailableBadges] = useState([]);

  // Image upload states for user edit
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    code: "",
    groupName: "",
    imageUrl: "",
  });
  const [badgeFormData, setBadgeFormData] = useState({
    badgeId: "",
    notes: "",
  });
  const [formData, setFormData] = useState({
    assignmentStatus: true,
    assignments: 8,
    participation: 9,
    performance: 7,
  });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getData(`/users/${id}`);
        if (res?.success && res.data?._id) {
          setUser(res.data);
        } else {
          setError("User not found or invalid response.");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(
          "Failed to load user. The server might be starting up. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // Handle image selection for user edit
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      setSelectedImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Firebase
  const uploadImageToFirebase = async (file) => {
    if (!file) return null;

    setIsUploading(true);
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `users/${id}_${timestamp}_${file.name}`;
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
  };

  // Fetch available badges when badge modal opens
  const fetchAvailableBadges = async () => {
    try {
      const res = await getData("/badges");
      if (res?.success) {
        // Get badge IDs that user already has
        const userBadgeIds =
          user?.badges?.map((userBadge) => userBadge.badgeId._id) || [];

        // Filter out badges that user already has
        const availableBadges = res.data.filter(
          (badge) => !userBadgeIds.includes(badge._id)
        );

        setAvailableBadges(availableBadges || []);
      }
    } catch (err) {
      console.error("Error fetching badges:", err);
      toast.error("Failed to load available badges.");
    }
  };

  // Handle opening badge modal
  const handleAddBadge = () => {
    setBadgeFormData({
      badgeId: "",
      notes: "",
    });
    setBadgeModalOpen(true);
    fetchAvailableBadges();
  };

  // Handle badge form submission
  const handleBadgeSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        userId: id,
        awardedBy: id,
        notes: badgeFormData.notes,
      };

      const res = await postData(
        `/badges/${badgeFormData.badgeId}/assign`,
        payload
      );

      if (res?.success) {
        // Refresh user data to show the new badge
        const updatedUser = await getData(`/users/${id}`);
        if (updatedUser?.success && updatedUser.data?._id) {
          setUser(updatedUser.data);
        }
        setBadgeModalOpen(false);
        toast.success("Badge assigned successfully!");
      } else {
        toast.error("Failed to assign badge. Please try again.");
      }
    } catch (err) {
      console.error("Error assigning badge:", err);
      toast.error("Error assigning badge. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle badge removal
  const handleRemoveBadge = async (badgeId) => {
    if (!confirm("Are you sure you want to remove this badge?")) {
      return;
    }

    try {
      const payload = {
        userId: id,
      };

      const response = await backendServer.delete(`/badges/${badgeId}/remove`, {
        data: payload,
      });

      const res = response.data;

      if (res?.success) {
        // Refresh user data to remove the badge
        const updatedUser = await getData(`/users/${id}`);
        if (updatedUser?.success && updatedUser.data?._id) {
          setUser(updatedUser.data);
        }
        toast.success("Badge removed successfully!");
      } else {
        toast.error("Failed to remove badge. Please try again.");
      }
    } catch (err) {
      console.error("Error removing badge:", err);
      toast.error("Error removing badge. Please try again.");
    }
  };

  // Handle badge form input changes
  const handleBadgeInputChange = (field, value) => {
    setBadgeFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle opening modal for adding new rating
  const handleAddRating = (day) => {
    setSelectedDay(day);
    setIsEditMode(false);
    setFormData({
      assignmentStatus: true,
      assignments: 8,
      participation: 9,
      performance: 7,
    });
    setModalOpen(true);
  };

  // Handle opening modal for editing existing rating
  const handleEditRating = (day) => {
    setSelectedDay(day);
    setIsEditMode(true);
    const rating = day.userRating.dailyRating;
    setFormData({
      assignmentStatus: rating.assignmentStatus,
      assignments: rating.assignments,
      participation: rating.participation,
      performance: rating.performance,
    });
    setModalOpen(true);
  };

  // Handle deleting existing rating
  const handleDeleteRating = async (day) => {
    if (!confirm("Are you sure you want to delete this rating?")) return;
    setSubmitting(true);
    try {
      const res = await deleteData(`/days/${day._id}/remove-user`, {
        userId: id,
      });
      if (res?.success) {
        const updatedUser = await getData(`/users/${id}`);
        if (updatedUser?.success && updatedUser.data?._id) {
          setUser(updatedUser.data);
        }
        toast.success("Rating deleted successfully!");
      } else {
        toast.error("Failed to delete rating. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting rating:", err);
      toast.error("Error deleting rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle opening modal for editing user
  const handleEditUser = () => {
    setUserFormData({
      name: user.name || "",
      email: user.email || "",
      code: user.code || "",
      groupName: user.groupName || "",
      imageUrl: user.imageUrl || "",
    });

    // Set existing image as preview
    if (user.imageUrl?.trim()) {
      setImagePreview(user.imageUrl);
    } else {
      setImagePreview("");
    }

    clearImageSelection(); // Clear any selected file
    setUserEditModalOpen(true);
  };

  // Handle user form submission
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = userFormData.imageUrl;

      // Upload new image if selected
      if (selectedImage) {
        try {
          imageUrl = await uploadImageToFirebase(selectedImage);
        } catch (uploadError) {
          toast.error("Failed to upload image. Please try again.");
          setSubmitting(false);
          return;
        }
      }

      const userData = {
        ...userFormData,
        imageUrl: imageUrl || "",
      };

      const res = await putData(`/users/${id}`, userData);

      if (res?.success) {
        // Refresh user data to show the updated information
        const updatedUser = await getData(`/users/${id}`);
        if (updatedUser?.success && updatedUser.data?._id) {
          setUser(updatedUser.data);
        }
        setUserEditModalOpen(false);
        clearImageSelection();
        toast.success("User updated successfully!");
      } else {
        toast.error("Failed to update user. Please try again.");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Error updating user. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle user form input changes
  const handleUserInputChange = (field, value) => {
    setUserFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        userId: id,
        dailyRating: {
          assignmentStatus: formData.assignmentStatus,
          assignments: parseInt(formData.assignments),
          participation: parseInt(formData.participation),
          performance: parseInt(formData.performance),
        },
      };

      let res;
      if (isEditMode) {
        // Edit existing rating
        res = await putData(`/days/${selectedDay._id}/update-rating`, payload);
      } else {
        // Add new rating
        res = await postData(`/days/${selectedDay._id}/add-user`, payload);
      }

      if (res?.success) {
        // Refresh user data to show the updated rating
        const updatedUser = await getData(`/users/${id}`);
        if (updatedUser?.success && updatedUser.data?._id) {
          setUser(updatedUser.data);
        }
        setModalOpen(false);
        toast.success(
          isEditMode
            ? "Rating updated successfully!"
            : "Rating added successfully!"
        );
      } else {
        toast.error(
          isEditMode
            ? "Failed to update rating. Please try again."
            : "Failed to add rating. Please try again."
        );
      }
    } catch (err) {
      console.error(
        isEditMode ? "Error updating rating:" : "Error adding rating:",
        err
      );
      toast.error(
        isEditMode
          ? "Error updating rating. Please try again."
          : "Error adding rating. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-700 font-medium">Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Classic Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="border-l-4 border-blue-600 pl-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                User Management
              </h1>
              <p className="text-gray-600">
                Comprehensive user profile and performance tracking
              </p>
            </div>
          </div>

          {error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          ) : user ? (
            <div className="space-y-8">
              {/* User Profile Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    User Profile
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <img
                          src={
                            user.imageUrl?.trim() ||
                            "https://via.placeholder.com/100"
                          }
                          alt={user.name}
                          className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200 shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white"></div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {user.name}
                        </h3>
                        <p className="text-gray-600 mb-3">{user.email}</p>
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            Code: {user.code}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            Group: {user.groupName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleEditUser}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
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
                      Edit Profile
                    </button>
                  </div>

                  {/* Information Grid */}
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Code", value: user.code, color: "blue" },
                      {
                        label: "Group",
                        value: user.groupName,
                        color: "purple",
                      },
                      {
                        label: "Joined",
                        value: new Date(user.createdAt).toLocaleDateString(),
                        color: "green",
                      },
                      {
                        label: "Last Updated",
                        value: new Date(user.updatedAt).toLocaleDateString(),
                        color: "orange",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                      >
                        <dt className="text-sm font-medium text-gray-500 mb-1">
                          {item.label}
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Badges Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Achievement Badges
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Recognition and accomplishments
                    </p>
                  </div>
                  <button
                    onClick={handleAddBadge}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors duration-200"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Badge
                  </button>
                </div>
                <div className="p-6">
                  {user.badges && user.badges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {user.badges.map((userBadge) => (
                        <BadgeCard
                          key={userBadge._id}
                          userBadge={userBadge}
                          onRemove={handleRemoveBadge}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No badges assigned
                      </h4>
                      <p className="text-gray-500 mb-4">
                        Award badges to recognize achievements and milestones
                      </p>
                      <button
                        onClick={handleAddBadge}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors duration-200"
                      >
                        Award First Badge
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Timeline */}
              {user.assignedMonths && user.assignedMonths.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Performance Timeline
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Monthly assignments and daily ratings
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {user.assignedMonths.map((month) => (
                        <MonthCard
                          key={month._id}
                          month={month}
                          onAddRating={handleAddRating}
                          onEditRating={handleEditRating}
                          onDeleteRating={handleDeleteRating}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">No user data available.</p>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-8 flex justify-center">
            <a
              href="/users"
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Users
            </a>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900/70 bg-opacity-85 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditMode ? "Edit Rating" : "Add Rating"} for Day{" "}
                {selectedDay?.dayNumber}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Date:{" "}
                {selectedDay && new Date(selectedDay.date).toLocaleDateString()}
              </p>
            </div>
            <div className="px-6 py-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Assignment Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Assignment Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: true, label: "Completed", color: "green" },
                      { value: false, label: "Not Completed", color: "red" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="assignmentStatus"
                          checked={formData.assignmentStatus === option.value}
                          onChange={() =>
                            handleInputChange("assignmentStatus", option.value)
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Score Inputs */}
                {[
                  { field: "assignments", label: "Assignments Score" },
                  { field: "participation", label: "Participation Score" },
                  { field: "performance", label: "Performance Score" },
                ].map((item) => (
                  <div key={item.field}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {item.label} (0-10)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={formData[item.field]}
                      onChange={(e) =>
                        handleInputChange(item.field, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                ))}
              </form>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {isEditMode ? "Updating..." : "Submitting..."}
                  </div>
                ) : isEditMode ? (
                  "Update Rating"
                ) : (
                  "Add Rating"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {userEditModalOpen && (
        <div className="fixed inset-0 bg-gray-900/70 bg-opacity-85 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit User Information
              </h3>
            </div>
            <div className="px-6 py-4">
              <form onSubmit={handleUserSubmit} className="space-y-6">
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
                          onClick={() => {
                            clearImageSelection();
                            setUserFormData((prev) => ({
                              ...prev,
                              imageUrl: "",
                            }));
                          }}
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
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF (MAX. 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                        disabled={isUploading || submitting}
                      />
                    </label>
                  </div>

                  {isUploading && (
                    <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Uploading image...
                    </p>
                  )}
                </div>

                {/* Text Fields */}
                {[
                  { field: "name", label: "Name", type: "text" },
                  { field: "email", label: "Email", type: "email" },
                  { field: "code", label: "Code", type: "text" },
                  { field: "groupName", label: "Group Name", type: "text" },
                ].map(({ field, label, type }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={userFormData[field]}
                      onChange={(e) =>
                        handleUserInputChange(field, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                ))}

                {/* Image URL Field (Alternative) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={userFormData.imageUrl}
                    onChange={(e) =>
                      handleUserInputChange("imageUrl", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can either upload an image above or provide an image URL
                    here
                  </p>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setUserEditModalOpen(false);
                  clearImageSelection();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={submitting || isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUserSubmit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={submitting || isUploading}
              >
                {(submitting || isUploading) && (
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {submitting
                  ? "Updating..."
                  : isUploading
                  ? "Uploading..."
                  : "Update User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Badge Assignment Modal */}
      {badgeModalOpen && (
        <div className="fixed inset-0 bg-gray-900/70 bg-opacity-85 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Badge to User
              </h3>
            </div>
            <div className="px-6 py-4">
              <form onSubmit={handleBadgeSubmit} className="space-y-6">
                {/* Badge Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Badge
                  </label>
                  <select
                    value={badgeFormData.badgeId}
                    onChange={(e) =>
                      handleBadgeInputChange("badgeId", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Choose a badge...</option>
                    {availableBadges.map((badge) => (
                      <option key={badge._id} value={badge._id}>
                        {badge.icon} {badge.name} - {badge.description}
                      </option>
                    ))}
                  </select>
                  {badgeFormData.badgeId && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-md border border-gray-200">
                      {(() => {
                        const selectedBadge = availableBadges.find(
                          (b) => b._id === badgeFormData.badgeId
                        );
                        return selectedBadge ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">
                                Category:
                              </span>
                              <span className="capitalize text-gray-900">
                                {selectedBadge.category}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">
                                Status:
                              </span>
                              <span
                                className={`font-medium ${
                                  selectedBadge.isActive
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {selectedBadge.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <span className="font-medium text-gray-600">
                                Requirements:
                              </span>
                              <p className="text-gray-700 mt-1">
                                {selectedBadge.requirements}
                              </p>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={badgeFormData.notes}
                    onChange={(e) =>
                      handleBadgeInputChange("notes", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Reason for awarding this badge..."
                  />
                </div>
              </form>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setBadgeModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleBadgeSubmit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Assigning...
                  </div>
                ) : (
                  "Assign Badge"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Badge Card Component
function BadgeCard({ userBadge, onRemove }) {
  const badge = userBadge.badgeId;
  const awardedBy = userBadge.awardedBy;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm"
              style={{ backgroundColor: badge.color }}
            >
              {badge.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">{badge.name}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {badge.description}
              </p>
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mt-2 capitalize">
                {badge.category}
              </span>
            </div>
          </div>
          <button
            onClick={() => onRemove(badge._id)}
            className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors duration-200"
            title="Remove badge"
          >
            <svg
              className="w-5 h-5"
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

        <div className="border-t border-gray-200 pt-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Awarded by:</span>
              <p className="font-medium text-gray-900 mt-1">{awardedBy.name}</p>
            </div>
            <div>
              <span className="text-gray-500">Date:</span>
              <p className="font-medium text-gray-900 mt-1">
                {new Date(userBadge.awardedDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          {userBadge.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-gray-500 text-xs">Notes:</span>
              <p className="text-gray-700 text-sm mt-1 italic">
                "{userBadge.notes}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Month Card Component
function MonthCard({ month, onAddRating, onEditRating, onDeleteRating }) {
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

  const monthName =
    monthNames[month.monthNumber - 1] || `Month ${month.monthNumber}`;

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <h4 className="text-lg font-semibold text-gray-900">
                {monthName} {month.year}
              </h4>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {month.name}
            </span>
          </div>
        </div>
      </div>
      <div className="p-6">
        {month.weeks && month.weeks.length > 0 && (
          <div className="space-y-6">
            {month.weeks.map((week) => (
              <WeekCard
                key={week._id}
                week={week}
                onAddRating={onAddRating}
                onEditRating={onEditRating}
                onDeleteRating={onDeleteRating}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Week Card Component
function WeekCard({ week, onAddRating, onEditRating, onDeleteRating }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-600 text-white rounded-md flex items-center justify-center text-sm font-bold">
            {week.weekNumber}
          </div>
          <h5 className="text-md font-medium text-gray-900">
            Week {week.weekNumber}
          </h5>
        </div>
        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-md border border-gray-200">
          {new Date(week.startDate).toLocaleDateString()} -{" "}
          {new Date(week.endDate).toLocaleDateString()}
        </span>
      </div>

      {week.days && week.days.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {week.days.map((day) => (
            <DayCard
              key={day._id}
              day={day}
              onAddRating={onAddRating}
              onEditRating={onEditRating}
              onDeleteRating={onDeleteRating}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Day Card Component
function DayCard({ day, onAddRating, onEditRating, onDeleteRating }) {
  const hasRating = day.userRating?.dailyRating;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-semibold text-gray-900">
            Day {day.dayNumber}
          </div>
          <div
            className={`w-3 h-3 rounded-full ${
              hasRating ? "bg-green-500" : "bg-gray-300"
            }`}
          ></div>
        </div>
        <div className="text-xs text-gray-500">
          {new Date(day.date).toLocaleDateString()}
        </div>
      </div>

      {hasRating ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <RatingItem
              label="Assignment"
              value={day.userRating.dailyRating.assignmentStatus ? "✓" : "✗"}
              isStatus={true}
            />
            <RatingItem
              label="Tasks"
              value={day.userRating.dailyRating.assignments}
              maxValue={10}
            />
            <RatingItem
              label="Participation"
              value={day.userRating.dailyRating.participation}
              maxValue={10}
            />
            <RatingItem
              label="Performance"
              value={day.userRating.dailyRating.performance}
              maxValue={10}
            />
          </div>
          <div className="space-y-2">
            <button
              onClick={() => onEditRating(day)}
              className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors duration-200"
            >
              Edit Rating
            </button>
            <button
              onClick={() => onDeleteRating(day)}
              className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-colors duration-200"
            >
              Delete Rating
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => onAddRating(day)}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>Add Rating</span>
        </button>
      )}
    </div>
  );
}

// Rating Item Component
function RatingItem({ label, value, maxValue = null, isStatus = false }) {
  const getColorClass = (val, max) => {
    if (isStatus) {
      return val === "✓" ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50";
    }
    const percentage = (val / max) * 100;
    if (percentage >= 80) return "text-green-700 bg-green-50";
    if (percentage >= 60) return "text-yellow-700 bg-yellow-50";
    return "text-red-700 bg-red-50";
  };

  return (
    <div className="flex justify-between items-center text-xs py-1 px-2 bg-gray-50 rounded border border-gray-200">
      <span className="text-gray-600 font-medium">{label}:</span>
      <span className={`font-semibold px-2 py-0.5 rounded ${getColorClass(value, maxValue)}`}>
        {isStatus ? value : `${value}${maxValue ? `/${maxValue}` : ""}`}
      </span>
    </div>
  );
}