"use client";

import React, { useState, useEffect } from "react";
import RatingModal from "./components/RatingModal";
import RatingsTable from "./components/RatingsTable";
import { getData, postData, putData, deleteData } from "../../libs/axios/server";
import Pagination from "../../components/ui/Pagination";

export default function RatingsPage() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRating, setEditingRating] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    name: "",
    role_en: "",
    role_ar: "",
  });


  // Fetch ratings from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getData("/ratings", );
      setRatings(response.data);
    } catch (err) {
      setError("Failed to load ratings. Please try again.");
      console.error("Fetch ratings error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ filters]);

  // Open modal to add new rating
  const handleAddRating = () => {
    setEditingRating(null);
    setIsModalOpen(true);
  };

  // Open modal to edit existing rating
  const handleEditRating = (rating) => {
    setEditingRating(rating);
    setIsModalOpen(true);
  };

  // Handle pagination
//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };

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

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ratings</h1>
          <p className="text-gray-600">
            Manage rating records {pagination.total > 0 && `(${pagination.total})`}
          </p>
        </div>
      </div> */}

      {/* Search & Add Button */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, role..."
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                setFilters({
                  name: value,
                  role_en: value,
                  role_ar: value,
                });
              }}
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
          onClick={handleAddRating}
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
          Add Rating
        </button>
      </div>

      {/* Ratings Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0072FF]"></div>
        </div>
      ) : ratings.length > 0 ? (
        <RatingsTable
          ratings={ratings}
          onEdit={handleEditRating}
          fetchData={fetchData}
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
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ratings found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Get started by adding your first rating"}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddRating}
              className="px-4 py-2 bg-[#0072FF] text-white rounded-md hover:bg-[#0061CC] transition-colors"
            >
              Add Your First Rating
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {/* {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )} */}

      {/* Modal */}
      <RatingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRating(null);
        }}
        rating={editingRating}
        fetchData={fetchData}
      />
    </div>
  );
}