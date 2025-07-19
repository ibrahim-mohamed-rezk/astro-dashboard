"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Plus,
  X,
  Edit2,
  Trash2,
  Award,
  Star,
  Calendar,
  Mail,
  Phone,
  Hash,
} from "lucide-react";
import { deleteData, getData, postData, putData } from "@/libs/axios/server";
import toast from "react-hot-toast";

const StudentControlPanel = () => {
  const params = useParams();
  const studentId = params.studentId;
  const [badges, setBadges] = useState([]);

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [showAddBadge, setShowAddBadge] = useState(false);
  const [showAddRating, setShowAddRating] = useState(false);
  const [editingRating, setEditingRating] = useState(null);

  // Form states
  const [badgeForm, setBadgeForm] = useState({
    badgeId: "",
  });
  const [ratingForm, setRatingForm] = useState({
    week: 1,
    day: 1,
    assignments: 0,
    participation: 0,
    performance: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getData(`students/${studentId}`, {}, {});
      setStudent(response.data);
    } catch (error) {
      setError("Failed to fetch student data");
      console.error("Error fetching student:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const response = await getData(`badges`, {}, {});
      setBadges(response.data);
    } catch (error) {
      setError("Failed to fetch student data");
      console.error("Error fetching student:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchData();
      fetchBadges();
    }
  }, [studentId]);

  // Badge CRUD operations
  const addBadge = async () => {
    try {
      await postData(`students/${studentId}/badges`, badgeForm, {
        Authorization: `Bearer token`,
        "Content-Type": "application/json",
      });

      toast.success("Badge added successfully");
      await fetchData();
      setShowAddBadge(false);
      setBadgeForm({ badgeId: "" });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const deleteBadge = async (badgeId) => {
    if (window.confirm("Are you sure you want to remove this badge?")) {
      try {
        await deleteData(
          `students/${studentId}/badges/${badgeId}`,
          {},
          {
            Authorization: `Bearer token`,
            "Content-Type": "application/json",
          }
        );

        toast.success("Badge removed successfully");
        await fetchData();
        setShowAddBadge(false);
        setBadgeForm({ badgeId: "" });
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  // Rating CRUD operations
  const addRating = async () => {
    try {
      await postData(`students/${studentId}/ratings`, ratingForm, {
        Authorization: `Bearer token`,
        "Content-Type": "application/json",
      });

      toast.success("Rating added successfully");
      fetchData();
      setShowAddRating(false);
      setRatingForm({
        week: 1,
        day: 1,
        assignments: 0,
        participation: 0,
        performance: 0,
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const updateRating = async (ratingId) => {
    try {
      await putData(`students/${studentId}/ratings/${ratingId}`, ratingForm, {
        Authorization: `Bearer token`,
        "Content-Type": "application/json",
      });

      toast.success("Rating added successfully");
      fetchData();
      setShowAddRating(false);
      setEditingRating(null);
      setRatingForm({
        week: 1,
        day: 1,
        assignments: 0,
        participation: 0,
        performance: 0,
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const deleteRating = async (ratingId) => {
    if (window.confirm("Are you sure you want to delete this rating?")) {
      try {
        await deleteData(
          `students/${studentId}/ratings/${ratingId}`,
          {},
          {
            Authorization: `Bearer token`,
            "Content-Type": "application/json",
          }
        );

        toast.success("rating removed successfully");
        await fetchData();
        setShowAddBadge(false);
        setBadgeForm({ badgeId: "" });
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4"
          style={{ borderColor: "#0072FF" }}
        ></div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );

  if (!student) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Student Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <img
              src={student.photo}
              alt={student.name}
              className="w-32 h-32 rounded-full object-cover border-4"
              style={{ borderColor: "#0072FF" }}
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {student.name}
              </h1>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Hash className="w-4 h-4" style={{ color: "#0C79FF" }} />
                  <span>{student.studentCode}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4" style={{ color: "#0C79FF" }} />
                  <span>{student.email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Phone className="w-4 h-4" style={{ color: "#0C79FF" }} />
                  <span>{student.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Badges Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Award style={{ color: "#0072FF" }} />
                Badges
              </h2>
              <button
                onClick={() => setShowAddBadge(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg"
                style={{ backgroundColor: "#0072FF" }}
              >
                <Plus className="w-5 h-5" />
                Add Badge
              </button>
            </div>

            <div className="space-y-4">
              {student.badges.map((badge) => (
                <div
                  key={badge._id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={badge.image}
                    alt={badge.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {badge.title}
                    </h3>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(badge.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteBadge(badge._id)}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {student.badges.length === 0 && (
                <p className="text-center text-gray-500 py-8">No badges yet</p>
              )}
            </div>
          </div>

          {/* Ratings Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Star style={{ color: "#0072FF" }} />
                Daily Ratings
              </h2>
              <button
                onClick={() => setShowAddRating(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg"
                style={{ backgroundColor: "#0072FF" }}
              >
                <Plus className="w-5 h-5" />
                Add Rating
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {student.ratings.map((rating) => (
                <div
                  key={rating._id}
                  className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar
                        className="w-4 h-4"
                        style={{ color: "#0C79FF" }}
                      />
                      <span className="font-semibold">
                        Week {rating.week}, Day {rating.day}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingRating(rating);
                          setRatingForm({
                            week: rating.week,
                            day: rating.day,
                            assignments: rating.assignments,
                            participation: rating.participation,
                            performance: rating.performance,
                          });
                        }}
                        className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRating(rating._id)}
                        className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Assignments</span>
                      <span className="font-medium">{rating.assignments}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Participation</span>
                      <span className="font-medium">
                        {rating.participation}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Performance</span>
                      <span className="font-medium">{rating.performance}%</span>
                    </div>
                  </div>
                </div>
              ))}
              {student.ratings.length === 0 && (
                <p className="text-center text-gray-500 py-8">No ratings yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Badge Modal */}
      {showAddBadge && (
        <div className="fixed inset-0 bg-[#00000063] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Add New Badge</h3>
              <button
                onClick={() => setShowAddBadge(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  choose bagde
                </label>
                <select
                  id="badge"
                  name="badge"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  onChangeCapture={(e) => {
                    setBadgeForm({ badgeId: e.target.value });
                  }}
                  value={badgeForm.badgeId}
                >
                  <option value="">Select a badge</option>
                  {badges.map((badge) => (
                    <option key={badge._id} value={badge._id}>
                      {badge.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={addBadge}
                className="w-full py-3 rounded-lg text-white font-medium transition-all hover:shadow-lg"
                style={{ backgroundColor: "#0072FF" }}
              >
                Add Badge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Rating Modal */}
      {(showAddRating || editingRating) && (
        <div className="fixed inset-0 bg-[#00000063] bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {editingRating ? "Edit Rating" : "Add Daily Rating"}
              </h3>
              <button
                onClick={() => {
                  setShowAddRating(false);
                  setEditingRating(null);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Week
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={ratingForm.week}
                    onChange={(e) =>
                      setRatingForm({
                        ...ratingForm,
                        week: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ focusRingColor: "#0072FF" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={ratingForm.day}
                    onChange={(e) =>
                      setRatingForm({
                        ...ratingForm,
                        day: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ focusRingColor: "#0072FF" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignments ({ratingForm.assignments}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ratingForm.assignments}
                  onChange={(e) =>
                    setRatingForm({
                      ...ratingForm,
                      assignments: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                  style={{ accentColor: "#0072FF" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Participation ({ratingForm.participation}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ratingForm.participation}
                  onChange={(e) =>
                    setRatingForm({
                      ...ratingForm,
                      participation: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                  style={{ accentColor: "#0072FF" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Performance ({ratingForm.performance}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ratingForm.performance}
                  onChange={(e) =>
                    setRatingForm({
                      ...ratingForm,
                      performance: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                  style={{ accentColor: "#0072FF" }}
                />
              </div>

              <button
                onClick={
                  editingRating
                    ? () => updateRating(editingRating._id)
                    : addRating
                }
                className="w-full py-3 rounded-lg text-white font-medium transition-all hover:shadow-lg"
                style={{ backgroundColor: "#0072FF" }}
              >
                {editingRating ? "Update Rating" : "Add Rating"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentControlPanel;
