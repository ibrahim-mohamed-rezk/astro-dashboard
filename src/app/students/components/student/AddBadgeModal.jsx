"use client";
import React from "react";
import { X } from "lucide-react";

const AddBadgeModal = ({ badges, badgeForm, setBadgeForm, onClose, onSubmit }) => {
  return (
    <div className="fixed inset-0 bg-[#00000063] bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Add New Badge</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Choose badge
            </label>
            <select
              id="badge"
              name="badge"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              onChange={(e) => setBadgeForm({ badgeId: e.target.value })}
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
            onClick={onSubmit}
            className="w-full py-3 rounded-lg text-white font-medium transition-all hover:shadow-lg"
            style={{ backgroundColor: "#0072FF" }}
          >
            Add Badge
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBadgeModal;