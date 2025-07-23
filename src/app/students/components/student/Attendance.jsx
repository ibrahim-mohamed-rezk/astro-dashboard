import React, { useState } from 'react';
import { deleteData, getData, postData, putData } from "../../../../libs/axios/server";
import toast from "react-hot-toast";
import AttendanceModal from './Attendance/AttendanceModal'; // Import the modal component

const Attendance = ({student, onDataChange}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
    const [editingRecord, setEditingRecord] = useState(null); // Store the record being edited

    // Get student ID from URL params
    const getStudentIdFromUrl = () => {
        const path = window.location.pathname;
        const segments = path.split('/');
        return segments[segments.length - 1]; // Gets the last segment (ID)
    };

    // log in json formatting
    console.log(JSON.stringify(student.attendance));
    
    const formatDate = (day, month) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[month - 1]} ${day}`;
    };

    // Analytics calculations
    const totalRecords = student?.attendance.length;
    const presentCount = student?.attendance.filter(r => r.status).length;
    const absentCount = student?.attendance.filter(r => !r.status).length;
    const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
    
    // Monthly breakdown
    const monthlyData = student?.attendance.reduce((acc, record) => {
        const monthName = formatDate(1, record.month).split(' ')[0];
        if (!acc[monthName]) {
            acc[monthName] = { present: 0, absent: 0, total: 0 };
        }
        if (record.status) {
            acc[monthName].present++;
        } else {
            acc[monthName].absent++;
        }
        acc[monthName].total++;
        return acc;
    }, {});

    // Recent attendance trend (last 7 records)
    const recentRecords = student.attendance.slice(-7);
    const recentAttendanceRate = recentRecords.length > 0 
        ? Math.round((recentRecords.filter(r => r.status).length / recentRecords.length) * 100)
        : 0;

    // Handle modal submission for both create and edit
    const handleModalSubmit = async (formData) => {
        setIsLoading(true);
        
        try {
            const studentId = getStudentIdFromUrl();
            let response;

            if (editingRecord) {
                // Update existing record
                const endpoint = `/attendance/${studentId}/attendance/${editingRecord._id}`;
                
                // Send only changed values
                const changedData = {};
                Object.keys(formData).forEach(key => {
                    if (formData[key] !== editingRecord[key]) {
                        changedData[key] = formData[key];
                    }
                });

                // If no changes, just close modal
                if (Object.keys(changedData).length === 0) {
                    closeModal();
                    setIsLoading(false);
                    return;
                }

                response = await putData(endpoint, changedData, {
                    "Content-Type": "application/json"
                });
                
                console.log('Attendance updated successfully:', response);
                toast.success('Attendance updated successfully!');
            } else {
                // Create new record
                const endpoint = `/attendance/${studentId}/attendance`;
                
                response = await postData(endpoint, formData, {
                    "Content-Type": "application/json"
                });
                
                console.log('Attendance added successfully:', response);
                toast.success('Attendance added successfully!');
            }
            
            // Close modal and refresh data
            closeModal();
            
            // Refetch student data
            if (onDataChange) {
                await onDataChange();
            }
            
        } catch (error) {
            console.error('Error submitting attendance:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error submitting attendance. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Open modal for creating new attendance
    const openCreateModal = () => {
        setEditingRecord(null);
        setIsModalOpen(true);
    };

    // Open modal for editing existing attendance
    const openEditModal = (record) => {
        setEditingRecord(record);
        setIsModalOpen(true);
    };

    // Close modal and reset state
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRecord(null);
    };

    const handleDeleteAttendance = async (attendanceId) => {
        if (!window.confirm('Are you sure you want to delete this attendance record?')) {
            return;
        }

        try {
            const studentId = getStudentIdFromUrl();
            const endpoint = `/attendance/${studentId}/attendance/${attendanceId}`;
            
            const response = await deleteData(endpoint);
            
            console.log('Attendance deleted successfully:', response);
            
            // Refetch student data
            if (onDataChange) {
                await onDataChange();
            }
            
            toast.success('Attendance deleted successfully!');
            
        } catch (error) {
            console.error('Error deleting attendance:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error deleting attendance. Please try again.';
            toast.error(errorMessage);
        }
    };
    
    return (
        <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Attendance Management</h2>
                    <p className="text-gray-600">Track and analyze student attendance patterns</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Attendance
                </button>
            </div>

            {/* Analytics Dashboard */}
            <div className="mb-8 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Records</p>
                                <p className="text-3xl font-bold text-blue-600">{totalRecords}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Present Days</p>
                                <p className="text-3xl font-bold text-green-600">{presentCount}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Absent Days</p>
                                <p className="text-3xl font-bold text-red-600">{absentCount}</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-full">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                                <p className="text-3xl font-bold text-purple-600">{attendanceRate}%</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Breakdown and Recent Trend */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Monthly Analysis */}
                    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
                            </svg>
                            Monthly Breakdown
                        </h3>
                        <div className="space-y-3">
                            {Object?.entries(monthlyData)?.map(([month, data]) => (
                                <div key={month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                                    <span className="font-medium text-gray-700">{month}</span>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-green-600 font-medium">{data?.present}P</span>
                                        <span className="text-red-600 font-medium">{data?.absent}A</span>
                                        <span className="text-blue-600 font-bold">{Math.round((data?.present / data?.total) * 100)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Trend */}
                    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            Recent Trend (Last 7 records)
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Recent Attendance Rate</span>
                                <span className={`text-2xl font-bold ${recentAttendanceRate >= 80 ? 'text-green-600' : recentAttendanceRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {recentAttendanceRate}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-500 ${recentAttendanceRate >= 80 ? 'bg-green-500' : recentAttendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${recentAttendanceRate}%` }}
                                ></div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {recentRecords.map((record, index) => (
                                    <div
                                        key={index}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${record?.status ? 'bg-green-500' : 'bg-red-500'}`}
                                        title={`${formatDate(record?.day, record?.month)} - ${record?.status ? 'Present' : 'Absent'}`}
                                    >
                                        {record?.status ? 'P' : 'A'}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Attendance Records</h3>
                <div className="flex bg-white rounded-xl shadow-md p-1">
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                            viewMode === 'cards' 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Cards
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                            viewMode === 'table' 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V6a2 2 0 012-2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
                        </svg>
                        Table
                    </button>
                </div>
            </div>

            {/* Cards View */}
            {viewMode === 'cards' && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {student.attendance.map((record) => (
                        <div 
                            key={record._id}
                            className={`p-6 rounded-2xl border-2 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 cursor-pointer ${
                                record?.status 
                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300' 
                                    : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:border-red-300'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xl font-bold text-gray-700">
                                    {formatDate(record?.day, record?.month)}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span 
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                                            record?.status
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                        }`}
                                    >
                                        {record?.status ? 'Present' : 'Absent'}
                                    </span>
                                    <button
                                        onClick={() => openEditModal(record)}
                                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-2 rounded-full transition-all duration-200 transform hover:scale-110"
                                        title="Edit attendance"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAttendance(record._id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-full transition-all duration-200 transform hover:scale-110"
                                        title="Delete attendance"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-2 bg-white bg-opacity-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
                                    </svg>
                                    Week: {record?.week}
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Created: {new Date(record?.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Week</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Month</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {student?.attendance?.map((record, index) => (
                                    <tr key={record._id} className="hover:bg-gray-50 transition-all duration-200">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">
                                                {formatDate(record.day, record.month)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{record.week}</td>
                                        <td className="px-6 py-4 text-gray-600">{record.month}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span 
                                                className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                                                    record.status
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {record.status ? 'Present' : 'Absent'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {new Date(record.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(record)}
                                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-2 rounded-full transition-all duration-200 transform hover:scale-110"
                                                    title="Edit attendance"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAttendance(record._id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-full transition-all duration-200 transform hover:scale-110"
                                                    title="Delete attendance"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {student?.attendance?.length === 0 && (
                <div className="text-center py-16">
                    <div className="bg-white rounded-2xl shadow-lg p-12 mx-auto max-w-md">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No attendance records found</h3>
                        <p className="text-gray-500">Start by adding your first attendance record</p>
                    </div>
                </div>
            )}

            {/* Reusable Modal Component */}
            <AttendanceModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleModalSubmit}
                isLoading={isLoading}
                editData={editingRecord}
                title="Attendance"
            />
        </div>
    );
};

export default Attendance;