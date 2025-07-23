"use client";
import React from "react";
import { X } from "lucide-react";

const RatingModal = ({ ratingForm, setRatingForm, isEditing, onClose, onSubmit }) => {
  return (
    <div className="fixed inset-0 bg-[#00000063] bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {isEditing ? "Edit Rating" : "Add Daily Rating"}
          </h3>
          <button
            onClick={onClose}
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
            onClick={onSubmit}
            className="w-full py-3 rounded-lg text-white font-medium transition-all hover:shadow-lg"
            style={{ backgroundColor: "#0072FF" }}
          >
            {isEditing ? "Update Rating" : "Add Rating"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;