"use client";

import React, { useState } from "react";
import { deleteData } from "../../../libs/axios/server";

interface Rating {
  _id: string;
  name: string;
  role_en: string;
  role_ar: string;
  rating: number;
  description_en: string;
  description_ar: string;
  createdAt: string;
  updatedAt: string;
  image: string;
}

interface RatingsTableProps {
  ratings: Rating[];
  onEdit: (rating: Rating) => void;
  fetchData: () => void;
}

export default function RatingsTable({
  ratings,
  onEdit,
  fetchData,
}: RatingsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rating?")) return;

    try {
      setDeletingId(id);
      await deleteData(`/ratings/${id}`);
      alert("Rating deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Error deleting rating:", error);
      alert("Failed to delete rating. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {Array.from({ length: 5 }, (_, index) => (
          <svg
            key={index}
            className={`w-4 h-4 ${
              index < rating ? "text-amber-400 drop-shadow-sm" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600 bg-green-50";
    if (rating >= 3) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (ratings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
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
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No ratings found
          </h3>
          <p className="text-gray-500">
            There are no ratings to display at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Person
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Role (EN)
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Role (AR)
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Comment (EN)
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Comment (AR)
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {ratings.map((rating, index) => (
              <tr
                key={rating._id}
                className={`hover:bg-gray-50 transition-colors duration-150 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-25"
                }`}
              >
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {rating.image ? (
                        <img
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-200 shadow-sm"
                          src={rating.image}
                          alt={rating.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                      ) : null}
                      <div
                        className={`h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm ${
                          rating.image ? "hidden" : ""
                        }`}
                      >
                        {rating.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {rating.name}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-gray-900 font-medium">
                    {rating.role_en}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-gray-900 font-medium" dir="rtl">
                    {rating.role_ar}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col space-y-2">
                    {renderStars(rating.rating)}
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getRatingColor(
                        rating.rating
                      )}`}
                    >
                      {rating.rating}/5
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-gray-700 max-w-xs">
                    {rating.description_en ? (
                      <div className="line-clamp-3 leading-relaxed">
                        {rating.description_en}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No comment</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-gray-700 max-w-xs" dir="rtl">
                    {rating.description_ar ? (
                      <div className="line-clamp-3 leading-relaxed">
                        {rating.description_ar}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">
                        لا يوجد تعليق
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-gray-500">
                    {formatDate(rating.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => onEdit(rating)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 hover:scale-105"
                      title="Edit rating"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(rating._id)}
                      disabled={deletingId === rating._id}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      title="Delete rating"
                    >
                      {deletingId === rating._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
