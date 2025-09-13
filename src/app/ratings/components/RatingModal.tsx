"use client";

import React, { useState, useEffect } from "react";
import { postData, putData } from "../../../libs/axios/server";
// @ts-ignore
import useUploadImage from "../hooks/useUploadImage";

export default function RatingModal({ isOpen, onClose, rating, fetchData }) {
  const isEditing = Boolean(rating);

  const [formData, setFormData] = useState({
    name: "",
    role_en: "",
    role_ar: "",
    rating: 0,
    description_en: "",
    description_ar: "",
    age: "",
    image: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const {
    uploading,
    imageUrl,
    error: uploadError,
    uploadImage,
    setImageUrl,
  } = useUploadImage();

  // Update form data when rating prop changes
  useEffect(() => {
    if (rating) {
      setFormData({
        name: rating.name || "",
        role_en: rating.role_en || "",
        role_ar: rating.role_ar || "",
        rating: rating.rating || 0,
        description_en: rating.description_en || "",
        description_ar: rating.description_ar || "",
        age: rating.age || "",
        image: rating.image || "",
      });
    } else {
      // Reset form for new rating
      setFormData({
        name: "",
        role_en: "",
        role_ar: "",
        rating: 0,
        description_en: "",
        description_ar: "",
        age: "",
        image: "",
      });
    }
    setErrors({});
  }, [rating]);

  React.useEffect(() => {
    if (rating?.image) {
      setImageUrl(rating.image);
    } else {
      setImageUrl("");
    }
  }, [rating, setImageUrl]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData?.name?.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData?.role_en?.trim()) {
      newErrors.role_en = "English role is required";
    }

    if (!formData?.role_ar?.trim()) {
      newErrors.role_ar = "Arabic role is required";
    }

    if (!formData?.age?.toString().trim()) {
      newErrors.age = "Age is required";
    } else if (parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      newErrors.age = "Age must be between 1 and 120";
    }

    if (formData?.rating < 1 || formData?.rating > 5) {
      newErrors.rating = "Please select a rating between 1 and 5 stars";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRatingChange = (newRating) => {
    setFormData((prev) => ({ ...prev, rating: newRating }));
    if (errors.rating) {
      setErrors((prev) => ({ ...prev, rating: "" }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size must be less than 5MB",
        }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select a valid image file",
        }));
        return;
      }

      setErrors((prev) => ({ ...prev, image: "" }));
      await uploadImage(file);
    }
  };

  React.useEffect(() => {
    if (imageUrl) {
      setFormData((prev) => ({ ...prev, image: imageUrl }));
    }
  }, [imageUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    const payload = {
      ...formData,
      rating: parseInt(formData.rating.toString()),
      age: parseInt(formData.age.toString()),
    };

    console.log("Submitting rating:", payload);

    try {
      if (isEditing) {
        await putData(`/ratings/${rating._id}`, payload);
      } else {
        await postData("/ratings", payload);
      }

      fetchData();
      onClose();
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to save rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isEditing ? "Edit Rating" : "Add New Rating"}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {isEditing
                    ? "Update the rating information"
                    : "Create a new customer rating"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
              aria-label="Close modal"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Name */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.name
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      } focus:ring-4`}
                      placeholder="Enter customer's full name"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      min="1"
                      max="120"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.age
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      } focus:ring-4`}
                      placeholder="Age"
                    />
                    {errors.age && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.age}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {imageUrl ? (
                      <div className="relative group">
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-xl border-4 border-gray-200 shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
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
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                    </div>
                    {uploading && (
                      <div className="flex items-center mt-2 text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                        Uploading image...
                      </div>
                    )}
                    {(uploadError || errors.image) && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {uploadError || errors.image}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Role Information Section */}
            <div className="space-y-6 pt-8 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Role Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Role English */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="role_en"
                    value={formData.role_en}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.role_en
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    } focus:ring-4`}
                    placeholder="e.g., Software Engineer"
                  />
                  {errors.role_en && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.role_en}
                    </p>
                  )}
                </div>

                {/* Role Arabic */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role (Arabic) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="role_ar"
                    value={formData.role_ar}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.role_ar
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    } focus:ring-4`}
                    placeholder="مثال: مهندس برمجيات"
                    dir="rtl"
                  />
                  {errors.role_ar && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.role_ar}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Rating Section */}
            <div className="space-y-6 pt-8 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-amber-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Rating & Feedback
                </h3>
              </div>

              {/* Rating Stars */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Overall Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <div className="flex items-center space-x-1 mb-2 sm:mb-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(star)}
                        className={`w-10 h-10 transition-all duration-200 hover:scale-110 ${
                          star <= formData.rating
                            ? "text-amber-400 drop-shadow-sm"
                            : "text-gray-300 hover:text-amber-300"
                        }`}
                      >
                        <svg
                          className="w-full h-full"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center">
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-semibold">
                      {formData.rating > 0
                        ? `${formData.rating}/5 Stars`
                        : "No rating selected"}
                    </span>
                  </div>
                </div>
                {errors.rating && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.rating}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Comment English */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Feedback (English)
                  </label>
                  <textarea
                    name="description_en"
                    value={formData.description_en}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                    placeholder="Share your experience and feedback..."
                  />
                </div>

                {/* Comment Arabic */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Feedback (Arabic)
                  </label>
                  <textarea
                    name="description_ar"
                    value={formData.description_ar}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                    placeholder="شارك تجربتك وملاحظاتك..."
                    dir="rtl"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions - Inside the form */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>
                        {isEditing ? "Update Rating" : "Create Rating"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
