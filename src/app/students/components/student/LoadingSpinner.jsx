"use client";
import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div
        className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4"
        style={{ borderColor: "#0072FF" }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;