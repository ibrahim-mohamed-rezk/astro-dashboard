"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FaPlus, FaTrophy, FaMedal, FaStar, FaCrown } from "react-icons/fa";
import { deleteData, getData, postData } from "../../libs/axios/server";

type Student = {
  _id: string;
  name: string;
  imageUrl?: string;
  groupName?: string;
  code?: string;
  email?: string;
  rank?: number;
  studentData?: Student;
  studentId?: string;
};


// Enhanced API functions with better error handling
const fetchBestStudents = async (): Promise<Student[]> => {
  try {
    const res = await getData("best-students");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error fetching best students:", error);
    throw new Error("Unable to load best students. Please try again.");
  }
};

const fetchAllStudents = async (): Promise<Student[]> => {
  try {
    const res = await getData("users");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error fetching all students:", error);
    throw new Error("Unable to load students. Please try again.");
  }
};

const addBestStudent = async (
  studentId: string,
  rank: number
): Promise<any> => {
  try {
    if (!studentId || rank < 1) {
      throw new Error("Invalid student ID or rank");
    }

    const res = await postData("best-students", { studentId, rank });
    return res.json ? await res.json() : res;
  } catch (error) {
    console.error("Error adding best student:", error);
    throw new Error("Unable to add student. Please try again.");
  }
};

const removeBestStudent = async (studentId: string): Promise<any> => {
  try {
    if (!studentId) {
      throw new Error("Invalid student ID");
    }

    const res = await deleteData(`best-students/${studentId}`);
 
    return res;
  } catch (error) {
    console.error("Error removing best student:", error);
    throw new Error("Unable to remove student. Please try again.");
  }
};

const BestStudentsPage = () => {
  // State management
  const [bestStudents, setBestStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedRank, setSelectedRank] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allStudentsLoaded, setAllStudentsLoaded] = useState(false);

  // Enhanced function to load best students with better error handling
  const loadBestStudents = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const students = await fetchBestStudents();
      const sortedStudents = students.sort(
        (a, b) => (a.rank || 0) - (b.rank || 0)
      );
      setBestStudents(sortedStudents);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load best students";
      setError(errorMessage);
      console.error("Error loading best students:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Load all students only when needed
  const loadAllStudents = useCallback(async () => {
    if (allStudentsLoaded) return;

    try {
      setError(null);
      const students = await fetchAllStudents();
      setAllStudents(students);
      setAllStudentsLoaded(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load students";
      setError(errorMessage);
    }
  }, [allStudentsLoaded]);

  // Initial data load
  useEffect(() => {
    loadBestStudents();
  }, [loadBestStudents]);

  // Load all students when modal opens
  useEffect(() => {
    if (showAddModal && !allStudentsLoaded) {
      loadAllStudents();
    }
  }, [showAddModal, allStudentsLoaded, loadAllStudents]);

  // Memoized rank utilities
  const getRankIcon = useMemo(
    () => (rank: number) => {
      switch (rank) {
        case 1:
          return <FaCrown className="text-yellow-500" />;
        case 2:
          return <FaTrophy className="text-gray-400" />;
        case 3:
          return <FaMedal className="text-orange-600" />;
        default:
          return <FaStar className="text-blue-500" />;
      }
    },
    []
  );

  const getRankBackground = useMemo(
    () => (rank: number) => {
      switch (rank) {
        case 1:
          return "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300";
        case 2:
          return "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300";
        case 3:
          return "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300";
        default:
          return "bg-white border-gray-200";
      }
    },
    []
  );

  // Enhanced add student function
  const handleAddStudent = useCallback(async () => {
    if (!selectedStudent || !selectedRank) {
      setError("Please select a student and enter a rank");
      return;
    }

    const rank = parseInt(selectedRank, 10);
    if (isNaN(rank) || rank < 1) {
      setError("Please enter a valid rank number (minimum 1)");
      return;
    }

    // Check if student is already in the list
    const isStudentAlreadyBest = bestStudents.some(
      (student) =>
        student._id === selectedStudent._id ||
        student.studentId === selectedStudent._id ||
        student.studentData?._id === selectedStudent._id
    );

    if (isStudentAlreadyBest) {
      setError("This student is already in the best students list");
      return;
    }

    setAdding(true);
    setError(null);

    try {
      // Check if there's already a student at this rank
      const existingStudent = bestStudents.find((s) => s.rank === rank);

      // Remove existing student at this rank if any
      if (existingStudent && existingStudent.studentId) {
        await removeBestStudent(existingStudent.studentId);
      }

      // Add the new student
      await addBestStudent(selectedStudent._id, rank);

      // Close modal and reset form
      setShowAddModal(false);
      setSelectedStudent(null);
      setSelectedRank("");
      setSearchQuery("");

      // Reload the best students list
      await loadBestStudents(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add student";
      setError(errorMessage);
    } finally {
      setAdding(false);
    }
  }, [selectedStudent, selectedRank, bestStudents, loadBestStudents]);

  // Enhanced remove student function with confirmation
  const handleRemoveStudent = useCallback(
    async (studentId: string, studentName?: string) => {
      if (!studentId) {
        setError("Invalid student ID");
        return;
      }
      setRemovingId(studentId);
      setError(null);

      try {
        await removeBestStudent(studentId);
        // Reload the list instead of manual state manipulation
        await loadBestStudents(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to remove student";
        setError(errorMessage);
      } finally {
        setRemovingId(null);
      }
    },
    [loadBestStudents]
  );

  // Enhanced modal close handler
  const closeModal = useCallback(() => {
    setShowAddModal(false);
    setSelectedStudent(null);
    setSelectedRank("");
    setSearchQuery("");
    setError(null);
  }, []);

  // Memoized filtered students for better performance
  const filteredStudents = useMemo(() => {
    if (!allStudents.length) return [];

    const query = searchQuery.toLowerCase().trim();

    return allStudents.filter((student) => {
      // Check if student is already in bestStudents
      const isAlreadyBest = bestStudents.some(
        (b) =>
          b._id === student._id ||
          b.studentId === student._id ||
          b.studentData?._id === student._id
      );

      if (isAlreadyBest) return false;

      // Search functionality
      if (!query) return true;

      const searchFields = [
        student.name,
        student.code,
        student.groupName,
        student.email,
      ]
        .filter(Boolean)
        .map((field) => field!.toLowerCase());

      return searchFields.some((field) => field.includes(query));
    });
  }, [allStudents, bestStudents, searchQuery]);

  // Input validation for rank
  const handleRankChange = useCallback(
    (value: string) => {
      // Only allow positive integers
      const numValue = value.replace(/[^0-9]/g, "");
      setSelectedRank(numValue);

      // Clear rank-related errors when user starts typing
      if (error && error.includes("rank")) {
        setError(null);
      }
    },
    [error]
  );

  // Clear search-related errors when user types
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (error && error.includes("select")) {
        setError(null);
      }
    },
    [error]
  );

  // Get safe student data helper
  const getStudentData = useCallback((student: Student) => {
    return student.studentData || student;
  }, []);

  // Safe image URL helper
  const getSafeImageUrl = useCallback((imageUrl?: string) => {
    return imageUrl?.trim() || "https://via.placeholder.com/80";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            🏆 Best Students Hall of Fame
          </h1>
          <p className="text-gray-600">
            Celebrating Excellence and Achievement
          </p>
        </div>

        {/* Enhanced Error Message */}
        {error && (
          <div className="mb-6 text-red-600 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-center shadow-sm">
            <span className="mr-3 text-xl">⚠️</span>
            <div className="flex-1">
              <p className="font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-400 hover:text-red-600 transition-colors p-1"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading best students...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {bestStudents.map((student) => {
              const studentData = getStudentData(student);
              return (
                <div
                  key={student._id}
                  className={`${getRankBackground(
                    student.rank || 0
                  )} border-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 p-5 relative group`}
                >
                  {/* Rank Badge */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-gray-100">
                    <span className="font-bold text-sm">
                      {getRankIcon(student.rank || 0)}
                    </span>
                  </div>

                  {/* Rank Number */}
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md">
                    {student.rank}
                  </div>

                  {/* Student Info */}
                  <div className="flex flex-col items-center mt-2">
                    <div className="relative mb-3">
                      <img
                        src={getSafeImageUrl(studentData.imageUrl)}
                        alt={studentData.name || "Student"}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/80";
                        }}
                      />
                    </div>
                    <h3 className="font-bold text-gray-800 text-center text-sm mb-1">
                      {studentData.name || "Unknown Student"}
                    </h3>
                    <p className="text-xs text-gray-600 text-center">
                      {studentData.groupName || "No Group"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {studentData.code || "No Code"}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    className="absolute top-2 right-2  group-hover:opacity-100 transition-all duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Remove ${studentData.name}`}
                    onClick={() =>
                      handleRemoveStudent(
                        student.studentId || student._id,
                        studentData.name
                      )
                    }
                    disabled={removingId === student._id}
                  >
                    {removingId === student._id ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    ) : (
                      "✕"
                    )}
                  </button>
                </div>
              );
            })}

            {/* Add Card */}
            <button
              className="flex flex-col items-center justify-center border-3 border-dashed border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl min-h-[200px] hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowAddModal(true)}
              disabled={adding}
              type="button"
              title="Add best student"
            >
              <FaPlus className="text-4xl text-blue-400 group-hover:text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-blue-600 font-semibold">Add Student</span>
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
              <h2 className="text-2xl font-bold">Add Best Student</h2>
              <p className="text-blue-100 mt-1">
                Select a student and assign a unique rank
              </p>
              <button
                className="absolute top-6 right-6 text-white hover:text-gray-200 text-3xl transition-colors"
                onClick={closeModal}
                title="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Rank Input */}
              <div className="mb-6 bg-blue-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rank Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter rank (e.g., 1, 2, 3...)"
                  value={selectedRank}
                  onChange={(e) => handleRankChange(e.target.value)}
                  className="w-full border-2 border-blue-200 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none transition-colors"
                  maxLength={3}
                />
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ If this rank is occupied, the existing student will be
                  replaced
                </p>
              </div>

              {/* Search Input */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Students ({filteredStudents.length} available)
                </label>
                <input
                  type="text"
                  placeholder="Search by name, code, group, or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Selected Student Display */}
              {selectedStudent && (
                <div className="mb-4 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                  <p className="text-sm font-semibold text-green-700 mb-2">
                    Selected Student:
                  </p>
                  <div className="flex items-center">
                    <img
                      src={getSafeImageUrl(selectedStudent.imageUrl)}
                      alt={selectedStudent.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white mr-3"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/40";
                      }}
                    />
                    <div>
                      <p className="font-semibold">{selectedStudent.name}</p>
                      <p className="text-xs text-gray-600">
                        {selectedStudent.groupName}
                        {selectedStudent.code && ` | ${selectedStudent.code}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Students List */}
              <div className="max-h-64 overflow-y-auto border-2 border-gray-200 rounded-lg">
                {!allStudentsLoaded ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading students...</p>
                  </div>
                ) : filteredStudents.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <div
                        key={student._id}
                        className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer transition ${
                          selectedStudent?._id === student._id
                            ? "bg-blue-50"
                            : ""
                        }`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <img
                          src={getSafeImageUrl(student.imageUrl)}
                          alt={student.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 mr-3"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/40";
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {student.name || "Unknown Student"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {student.groupName || "No Group"}
                            {student.code && ` | ${student.code}`}
                          </p>
                        </div>
                        {selectedStudent?._id === student._id && (
                          <div className="text-green-500">
                            <svg
                              className="w-6 h-6"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p className="mb-2">
                      {searchQuery
                        ? "No students found matching your search."
                        : "All students are already in the best students list."}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-blue-500 hover:text-blue-600 text-sm underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={closeModal}
                  disabled={adding}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                  onClick={handleAddStudent}
                  disabled={adding || !selectedStudent || !selectedRank}
                >
                  {adding ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Add Student
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BestStudentsPage;
