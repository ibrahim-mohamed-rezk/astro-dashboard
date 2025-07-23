import React, { useState, useEffect } from 'react';

const AttendanceModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    isLoading, 
    editData = null, // Pass attendance record for editing, null for creating
    title = "Attendance" 
}) => {
    const [formData, setFormData] = useState({
        day: new Date().getDate(),
        week: Math.ceil(new Date().getDate() / 7),
        month: new Date().getMonth() + 1,
        status: true
    });

    // Reset form when modal opens/closes or editData changes
    useEffect(() => {
        if (isOpen) {
            if (editData) {
                // Editing mode - populate with existing data
                setFormData({
                    day: editData.day,
                    week: editData.week,
                    month: editData.month,
                    status: editData.status
                });
            } else {
                // Creating mode - reset to defaults
                setFormData({
                    day: new Date().getDate(),
                    week: Math.ceil(new Date().getDate() / 7),
                    month: new Date().getMonth() + 1,
                    status: true
                });
            }
        }
    }, [isOpen, editData]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : parseInt(value) || value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleClose = () => {
        onClose();
    };

    if (!isOpen) return null;

    const isEditMode = !!editData;
    const modalTitle = isEditMode ? `Edit ${title}` : `Add New ${title}`;
    const submitButtonText = isEditMode ? 'Update' : 'Add';
    const loadingText = isEditMode ? 'Updating...' : 'Adding...';

    return (
        <div className="fixed inset-0 bg-gray-400/50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isEditMode ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            )}
                        </svg>
                        {modalTitle}
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all duration-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Day
                            </label>
                            <input
                                type="number"
                                name="day"
                                min="1"
                                max="31"
                                value={formData.day}
                                onChange={handleInputChange}
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-300"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Week
                            </label>
                            <input
                                type="number"
                                name="week"
                                min="1"
                                value={formData.week}
                                onChange={handleInputChange}
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-300"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Month
                            </label>
                            <input
                                type="number"
                                name="month"
                                min="1"
                                max="12"
                                value={formData.month}
                                onChange={handleInputChange}
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:border-gray-300"
                                required
                            />
                        </div>

                        <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                            <input
                                type="checkbox"
                                name="status"
                                checked={formData.status}
                                onChange={handleInputChange}
                                className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 rounded transition-all duration-200"
                            />
                            <label className="text-sm font-semibold text-gray-700">
                                Present
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 transition-all duration-200 font-medium transform hover:scale-105"
                        >
                            {isLoading ? loadingText : `${submitButtonText} Attendance`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AttendanceModal;