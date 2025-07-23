"use client";
import React from "react";
import { Award, Plus, Trash2 } from "lucide-react";

const BadgesSection = ({ student, onAddBadge, onDeleteBadge }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Award style={{ color: "#0072FF" }} />
          Badges
        </h2>
        <button
          onClick={onAddBadge}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg"
          style={{ backgroundColor: "#0072FF" }}
        >
          <Plus className="w-5 h-5" />
          Add Badge
        </button>
      </div>

      <div className="space-y-4">
        {student?.badges?.map((badge) => (
          <div
            key={badge?._id}
            className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <img
              src={badge?.image}
              alt={badge?.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{badge?.title}</h3>
              <p className="text-sm text-gray-600">{badge?.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(badge?.createdAt)?.toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => onDeleteBadge(badge?._id)}
              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        {student?.badges?.length === 0 && (
          <p className="text-center text-gray-500 py-8">No badges yet</p>
        )}
      </div>
    </div>
  );
};

export default BadgesSection;