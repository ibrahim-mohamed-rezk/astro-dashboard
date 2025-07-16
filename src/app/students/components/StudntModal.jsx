import { useEffect, useState } from "react";

const StudentModal = ({ isOpen, onClose, student, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    photo: "",
    badges: [],
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        photo: student.photo || "",
        badges: student.badges || [],
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        photo: "",
        badges: [],
      });
    }
  }, [student, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleBadgeAdd = (badge) => {
    if (badge.trim() && !formData.badges.includes(badge.trim())) {
      setFormData((prev) => ({
        ...prev,
        badges: [...prev.badges, badge.trim()],
      }));
    }
  };

  const handleBadgeRemove = (badgeToRemove) => {
    setFormData((prev) => ({
      ...prev,
      badges: prev.badges.filter((badge) => badge !== badgeToRemove),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#0072FF] to-[#0C79FF] text-white p-6 rounded-t-lg">
          <h2 className="text-xl font-semibold">
            {student ? "Edit Student" : "Add New Student"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              Photo URL
            </label>
            <input
              type="url"
              value={formData.photo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, photo: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072FF] focus:border-transparent"
              placeholder="Enter photo URL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Badges
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.badges.map((badge, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 text-sm bg-[#0072FF] text-white rounded-full"
                >
                  {badge}
                  <button
                    type="button"
                    onClick={() => handleBadgeRemove(badge)}
                    className="ml-2 text-white hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleBadgeAdd(e.target.value);
                  e.target.value = "";
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0072FF] focus:border-transparent"
              placeholder="Type badge name and press Enter"
            />
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
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0072FF] to-[#0C79FF] text-white rounded-md hover:from-[#0061CC] hover:to-[#0B69CC] transition-all"
            >
              {student ? "Update" : "Create"} Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;