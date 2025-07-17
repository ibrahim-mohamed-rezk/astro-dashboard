"use client";
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Award, Upload, X } from "lucide-react";
import { deleteData, getData, postData } from "@/libs/axios/server";
import Pagination from "@/components/ui/Pagination";
import axios from "axios";

const BadgesManager = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 15 });
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getData(
        "badges",
        { page: currentPage, limit: 15 },
        {}
      );
      setBadges(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setError("Failed to fetch students data");
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete badge
  const handleDeleteBadge = async (id) => {
    try {
      await deleteData(`/badges/${id}`, {}, {});
      fetchData();
    } catch (error) {
      toast.error("Failed to delete badge");
      console.error("Error deleting badge:", error);
    }
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      await postData("badges", formData, {
        Authorization: `Bearer token`,
        "Content-Type": "multipart/form-data",
      });

      setShowAddModal(false);
      setFormData({
        title: "",
        description: "",
        image: null,
      });
      setUploading(false);
      setImagePreview("");
      fetchData();
    } catch (error) {
      setUploading(false);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.msg || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Badges</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #0072FF 0%, #0C79FF 100%)",
            }}
          >
            <Plus className="w-5 h-5" />
            Add Badge
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div
              className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"
              style={{ borderTopColor: "#0072FF" }}
            ></div>
          </div>
        )}

        {/* Badges Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {badges.map((badge) => (
              <div
                key={badge._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden group"
              >
                <div
                  className="relative h-48 overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, #0072FF 0%, #0C79FF 100%)",
                  }}
                >
                  {badge.image ? (
                    <img
                      src={badge.image}
                      alt={badge.title}
                      className="w-full h-full object-contain p-6"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Award className="w-20 h-20 text-white opacity-50" />
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteBadge(badge._id)}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-200 hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {badge.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {badge.description}
                  </p>
                  <div className="mt-4 text-xs text-gray-400">
                    Created: {new Date(badge.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />

        {/* Empty State */}
        {!loading && badges.length === 0 && (
          <div className="text-center py-20">
            <Award className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No badges yet
            </h3>
            <p className="text-gray-500">
              Create your first badge to get started
            </p>
          </div>
        )}

        {/* Add Badge Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-[#00000091] bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform scale-100 animate-in">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Create New Badge
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({ title: "", description: "", image: null });
                      setImagePreview("");
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Badge Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="Enter badge title"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none"
                    placeholder="Describe this badge"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Badge Image
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="badge-image"
                    />
                    <label
                      htmlFor="badge-image"
                      className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                    >
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-32 object-contain"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFormData((prev) => ({ ...prev, image: null }));
                              setImagePreview("");
                            }}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            Click to upload image
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({ title: "", description: "", image: null });
                      setImagePreview("");
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={
                      uploading || !formData.title || !formData.description
                    }
                    className="flex-1 px-6 py-3 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    style={{
                      background:
                        "linear-gradient(135deg, #0072FF 0%, #0C79FF 100%)",
                    }}
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Creating...
                      </span>
                    ) : (
                      "Create Badge"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgesManager;
