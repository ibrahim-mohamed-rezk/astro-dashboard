"use client";
import React from "react";
import { Hash, Mail, Phone } from "lucide-react";

const StudentHeader = ({ student }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <img
          src={student?.photo}
          alt={student?.name}
          className="w-32 h-32 rounded-full object-cover border-4"
          style={{ borderColor: "#0072FF" }}
        />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {student?.name}
          </h1>
          <div className="space-y-2 text-gray-600">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Hash className="w-4 h-4" style={{ color: "#0C79FF" }} />
              <span>{student?.studentCode}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4" style={{ color: "#0C79FF" }} />
              <span>{student?.email}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Phone className="w-4 h-4" style={{ color: "#0C79FF" }} />
              <span>{student?.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHeader;