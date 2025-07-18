"use client";

import { useState, useEffect } from "react";
import StudentModal from "./components/StudntModal";
import { getData } from "@/libs/axios/server";
import StudentsTable from "./components/StudentsTable";
import Pagination from "@/components/ui/Pagination";

// Students Table Component

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ page: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    phone: "",
    studentCode: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getData(
        "students/filters",
        { page: currentPage, limit: 15, ...filters },
        {}
      );
      setStudents(response.data);
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
  }, [currentPage, filters]);

  // Handle student actions
  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg">{error}</div>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-[#0072FF] text-white rounded-md hover:bg-[#0061CC]"
        >
          Try Again
        </button>
      </div>
    );
  }

  console.log(filters);

  return (
    <div className="space-y-6 p-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div></div>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search students by name, email, or code..."
              value={
                filters.name ||
                filters.email ||
                filters.phone ||
                filters.studentCode
              }
              onChange={(e) =>
                setFilters({
                  ...filters,
                  name: e.target.value,
                  email: e.target.value,
                  phone: e.target.value,
                  studentCode: e.target.value,
                })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0072FF] focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <button
          onClick={handleAddStudent}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-[#0072FF] to-[#0C79FF] text-white rounded-lg hover:from-[#0061CC] hover:to-[#0B69CC] transition-all shadow-md"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Student
        </button>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0072FF]"></div>
        </div>
      ) : students?.length > 0 ? (
        <StudentsTable
          students={students}
          onEdit={handleEditStudent}
          feachData={fetchData}
        />
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No students found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Get started by adding your first student"}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddStudent}
              className="px-4 py-2 bg-[#0072FF] text-white rounded-md hover:bg-[#0061CC] transition-colors"
            >
              Add Your First Student
            </button>
          )}
        </div>
      )}

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />

      {/* Student Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudent(null);
        }}
        student={editingStudent}
        editingStudent={editingStudent}
        setEditingStudent={setEditingStudent}
        setIsModalOpen={setIsModalOpen}
        fetchData={fetchData}
        studentId={editingStudent?._id}
      />
    </div>
  );
}
