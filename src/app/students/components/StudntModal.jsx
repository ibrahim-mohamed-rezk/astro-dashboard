// components/StudentModal.jsx
"use client";
import { useEffect } from "react";
import React, { useState } from "react";
import useUploadImage from "../hooks/useUploadImage";
import { postData, putData } from "../../../libs/axios/server";

export default function StudentModal({ isOpen, onClose, student, fetchData }) {
  const isEditing = !!student;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    Image: "",
  });

  // Update form data when student prop changes 
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        Image: student.Image || "",
      });
    } else {
      // Reset form for new student
      setFormData({
        name: "",
        email: "",
        phone: "",
        Image: "",
      });
    }
  }, [student]);

  const {
    uploading,
    imageUrl,
    error: uploadError,
    uploadImage,
    setImageUrl,
  } = useUploadImage();

  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (student?.Image) {
      // Only set if it's a valid Firebase URL (optional safety)
      if (student.Image.includes("firebasestorage.googleapis.com")) {
        setImageUrl(student.Image);
      } else {
        console.warn("External image URL detected. Not loading:", student.Image);
        setImageUrl("");
      }
    } else {
      setImageUrl("");
    }
  }, [student, setImageUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData?.name?.trim()) return alert("Name is required.");
    if (!formData?.email?.includes("@")) return alert("Valid email is required.");
    if (!formData?.phone?.trim()) return alert("Phone is required.");

    setSubmitting(true);

    const payload = {
      ...formData,
      Image: imageUrl || "", // Use Firebase URL or empty
    };

    console.log("Submitting student:", payload); // 🔍 Debug

    try {
      if (isEditing) {
        await putData(`/students/${student._id}`, payload);
      } else {
        await postData("/students", payload);
      }
      fetchData();
      onClose();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save student. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">
          {isEditing ? "Edit Student" : "Add New Student"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 
                file:mr-4 file:py-2 file:px-4 file:rounded-full 
                file:border-0 file:text-sm file:font-semibold 
                file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploading && <p className="text-blue-500 text-sm mt-1">Uploading image...</p>}
            {uploadError && <p className="text-red-500 text-sm mt-1">{uploadError}</p>}
            {imageUrl && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="Profile"
                  className="w-20 h-20 object-cover rounded-full border"
                />
                <p className="text-xs text-green-600 mt-1">Uploaded successfully ✅</p>
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData?.name || ""}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData?.email || ""}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData?.phone || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Save Student"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}