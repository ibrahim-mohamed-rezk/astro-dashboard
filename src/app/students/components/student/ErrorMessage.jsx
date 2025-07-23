"use client";
import React from "react";

const ErrorMessage = ({ message }) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-red-500 text-lg">{message}</div>
    </div>
  );
};

export default ErrorMessage;