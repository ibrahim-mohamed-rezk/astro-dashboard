"use client";
import React from "react";
import { Star, Plus, Calendar, Edit2, Trash2 } from "lucide-react";

const RatingsSection = ({ student, onAddRating, onEditRating, onDeleteRating }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Star style={{ color: "#0072FF" }} />
          Daily Ratings
        </h2>
        <button
          onClick={onAddRating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg"
          style={{ backgroundColor: "#0072FF" }}
        >
          <Plus className="w-5 h-5" />
          Add Rating
        </button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {student?.ratings.map((rating) => (
          <div
            key={rating._id}
            className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: "#0C79FF" }} />
                <span className="font-semibold">
                  Week {rating?.week}, Day {rating?.day}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditRating(rating)}
                  className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteRating(rating?._id)}
                  className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Assignments</span>
                <span className="font-medium">{rating?.assignments}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Participation</span>
                <span className="font-medium">{rating?.participation}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Performance</span>
                <span className="font-medium">{rating?.performance}%</span>
              </div>
            </div>
          </div>
        ))}
        {student?.ratings.length === 0 && (
          <p className="text-center text-gray-500 py-8">No ratings yet</p>
        )}
      </div>
    </div>
  );
};

export default RatingsSection;