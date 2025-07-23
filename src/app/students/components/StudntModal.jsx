import { postData, putData } from "../../../libs/axios/server";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

const StudentModal = ({
  isOpen,
  onClose,
  student,
  editingStudent,
  setEditingStudent,
  setIsModalOpen,
  fetchData,
  studentId,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    photo: "",
  });
  const [photoPreview, setPhotoPreview] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        photo: student.photo || "",
      });
      setPhotoPreview(student.photo || "");
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        photo: "",
      });
      setPhotoPreview("");
    }
  }, [student, isOpen]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: file }));
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: "" }));
    setPhotoPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (editingStudent) {
      try {
        await putData(`students/${studentId}`, formData, {
          Authorization: `Bearer token`,
          "Content-Type": "multipart/form-data",
        });

        setIsModalOpen(false);
        setEditingStudent(null);
        toast.success("Student updated successfully");
        fetchData();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    } else {
      try {
        await postData("students", formData, {
          Authorization: `Bearer token`,
          "Content-Type": "multipart/form-data",
        });

        setIsModalOpen(false);
        setEditingStudent(null);
        toast.success("Student added successfully");
        fetchData();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000063] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#0072FF] to-[#0C79FF] text-white p-6 rounded-t-lg">
          <h2 className="text-xl font-semibold">
            {student ? "Edit Student" : "Add New Student"}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072FF] focus:border-transparent"
              placeholder="Enter student name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072FF] focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072FF] focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden shadow-sm"
                  style={{ minWidth: "5rem", minHeight: "5rem" }}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-10 h-10 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4a4 4 0 014 4v1h1a2 2 0 012 2v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7a2 2 0 012-2h1V8a4 4 0 014-4z"
                      />
                    </svg>
                  )}
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-gray-100 transition"
                      title="Remove photo"
                    >
                      <svg
                        className="w-4 h-4 text-gray-500"
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
                  )}
                </div>
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-block px-4 py-2 bg-gradient-to-r from-[#0072FF] to-[#0C79FF] text-white rounded-md cursor-pointer hover:from-[#0061CC] hover:to-[#0B69CC] transition-all text-sm font-medium"
                >
                  {photoPreview ? "Change Photo" : "Upload Photo"}
                </label>
                <div className="text-xs text-gray-400 mt-1">
                  JPG, PNG, or GIF. Max 2MB.
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0072FF] to-[#0C79FF] text-white rounded-md hover:from-[#0061CC] hover:to-[#0B69CC] transition-all"
            >
              {student ? "Update" : "Create"} Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentModal;
