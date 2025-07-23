"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { deleteData, getData, postData, putData } from "../../../libs/axios/server";
import toast from "react-hot-toast";

// Import components
import StudentHeader from "../components/student/StudentHeader";
import BadgesSection from "../components/student/BadgesSection";
import RatingsSection from "../components/student/RatingsSection";
import AddBadgeModal from "../components/student/AddBadgeModal";
import RatingModal from "../components/student/RatingModal";
import LoadingSpinner from "../components/student/LoadingSpinner";
import ErrorMessage from "../components/student/ErrorMessage";
import Attendance from "../components/student/Attendance";

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
  const [badgeForm, setBadgeForm] = useState({ badgeId: "" });
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
      setStudent(response?.data);
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
      setBadges(response?.data);
    } catch (error) {
      setError("Failed to fetch badges data");
      console.error("Error fetching badges:", error);
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

  // Badge handlers
  const handleAddBadge = async () => {
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
      toast.error(error.response?.data?.message || "Failed to add badge");
    }
  };

  const handleDeleteBadge = async (badgeId) => {
    if (window.confirm("Are you sure you want to remove this badge?")) {
      try {
        await deleteData(`students/${studentId}/badges/${badgeId}`, {}, {
          Authorization: `Bearer token`,
          "Content-Type": "application/json",
        });
        toast.success("Badge removed successfully");
        await fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to remove badge");
      }
    }
  };

  // Rating handlers
  const handleAddRating = async () => {
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
      toast.error(error.response?.data?.message || "Failed to add rating");
    }
  };

  const handleUpdateRating = async () => {
    try {
      await putData(
        `students/${studentId}/ratings/${editingRating._id}`,
        ratingForm,
        {
          Authorization: `Bearer token`,
          "Content-Type": "application/json",
        }
      );
      toast.success("Rating updated successfully");
      fetchData();
      setEditingRating(null);
      setRatingForm({
        week: 1,
        day: 1,
        assignments: 0,
        participation: 0,
        performance: 0,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update rating");
    }
  };

  const handleDeleteRating = async (ratingId) => {
    if (window.confirm("Are you sure you want to delete this rating?")) {
      try {
        await deleteData(`students/${studentId}/ratings/${ratingId}`, {}, {
          Authorization: `Bearer token`,
          "Content-Type": "application/json",
        });
        toast.success("Rating removed successfully");
        await fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to remove rating");
      }
    }
  };

  const handleEditRating = (rating) => {
    setEditingRating(rating);
    setRatingForm({
      week: rating.week,
      day: rating.day,
      assignments: rating.assignments,
      participation: rating.participation,
      performance: rating.performance,
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!student) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <StudentHeader student={student} />

        <div className="grid md:grid-cols-2 gap-6">
          <BadgesSection
            student={student}
            onAddBadge={() => setShowAddBadge(true)}
            onDeleteBadge={handleDeleteBadge}
          />

          <RatingsSection
            student={student}
            onAddRating={() => setShowAddRating(true)}
            onEditRating={handleEditRating}
            onDeleteRating={handleDeleteRating}
          />
        </div>
      </div>

      {/* Modals */}
      {showAddBadge && (
        <AddBadgeModal
          badges={badges}
          badgeForm={badgeForm}
          setBadgeForm={setBadgeForm}
          onClose={() => setShowAddBadge(false)}
          onSubmit={handleAddBadge}
        />
      )}

      {(showAddRating || editingRating) && (
        <RatingModal
          ratingForm={ratingForm}
          setRatingForm={setRatingForm}
          isEditing={!!editingRating}
          onClose={() => {
            setShowAddRating(false);
            setEditingRating(null);
          }}
          onSubmit={editingRating ? handleUpdateRating : handleAddRating}
        />
      )}
       <Attendance student={student} onDataChange={fetchData} />
    </div>
  );
};

export default StudentControlPanel;