"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

// API functions
import { getData, postData, putData, deleteData } from '../../../libs/axios/server';

// ✅ Gregorian Date in Arabic (Modern Format)
const formatDate = (dateString) => {
  if (!dateString) return 'تاريخ غير صالح';
  const date = new Date(dateString);
  if (isNaN(date)) return 'تاريخ غير صالح';

  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    calendar: 'gregory',
    numberingSystem: 'latn' // Keeps numbers as 1,2,3 not ١,٢,٣ if preferred
  }).format(date);
};

// Month Options (Arabic)
const MONTH_OPTIONS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

// Find nested item (month/week/day) in student
const findItemInStudent = (student, itemType, itemId) => {
  if (!student) return null;
  for (const month of student.months || []) {
    if (itemType === 'month' && month._id === itemId) return { ...month, monthId: month._id };
    for (const week of month.weeks || []) {
      if (itemType === 'week' && week._id === itemId) return { ...week, monthId: month._id };
      for (const day of week.days || []) {
        if (itemType === 'day' && day._id === itemId) {
          return { ...day, monthId: month._id, weekId: week._id };
        }
      }
    }
  }
  return null;
};

const StudentsTables = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [openRows, setOpenRows] = useState({});
  const { register, handleSubmit, reset, setValue } = useForm();

  // Load student data
  const fetchStudentData = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await getData(`/students/${studentId}`);
      if (res.success) {
        setStudent(res.data);
      } else {
        toast.error('فشل تحميل بيانات الطالب');
      }
    } catch (err) {
      toast.error('خطأ في الشبكة: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  // Open Modal
  const openModal = (type, data = {}) => {
    setModalType(type);
    setFormData(data);
    setEditingItem(data._id || null);
    reset(data);
    setShowModal(true);
  };

  // Close Modal
  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setModalType('');
      setEditingItem(null);
      setFormData({});
      reset({});
    }, 300);
  };

  // Submit Form
  const onSubmit = async (data) => {
    try {
      const endpoint = `/students/${studentId}`;
      let response;

      // Ensure numbers are cast correctly
      if (data.dayNumber) data.dayNumber = Number(data.dayNumber);
      if (data.monthNumber) data.monthNumber = Number(data.monthNumber);
      if (data.year) data.year = Number(data.year);
      if (data.weekNumber) data.weekNumber = Number(data.weekNumber);

      switch (modalType) {
        case 'createBadge':
          response = await postData(`${endpoint}/badges`, data);
          break;
        case 'editBadge':
          response = await putData(`${endpoint}/badges/${editingItem}`, data);
          break;
        case 'createMonth':
          response = await postData(`${endpoint}/months`, data);
          break;
        case 'editMonth':
          response = await putData(`${endpoint}/months/${editingItem}`, data);
          break;
        case 'createWeek':
          response = await postData(`${endpoint}/months/${data.monthId}/weeks`, data);
          break;
        case 'editWeek':
          if (!formData.monthId) return toast.error('الشهر مفقود');
          response = await putData(`${endpoint}/months/${formData.monthId}/weeks/${editingItem}`, data);
          break;
        case 'createDay': {
          const { monthId, weekId, ...body } = data;
          response = await postData(
            `${endpoint}/months/${monthId}/weeks/${weekId}/days`,
            body
          );
          break;
        }
        case 'editDay':
          if (!formData.monthId || !formData.weekId) return toast.error('بيانات الشهر أو الأسبوع مفقودة');
          response = await putData(
            `${endpoint}/months/${formData.monthId}/weeks/${formData.weekId}/days/${editingItem}`,
            data
          );
          break;
        case 'editRating':
          if (!formData.monthId || !formData.weekId) return toast.error('بيانات الشهر أو الأسبوع مفقودة');
          response = await putData(
            `${endpoint}/months/${formData.monthId}/weeks/${formData.weekId}/days/${editingItem}/ratings`,
            data
          );
          break;
        default:
          closeModal();
          return;
      }

      if (response.success) {
        toast.success('تم التحديث بنجاح ✅');
        await fetchStudentData();
        closeModal();
      } else {
        toast.error(response.message || 'فشل في الحفظ');
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع ❌');
      console.error(error);
    }
  };

  // Delete Handler
  const handleDelete = async (type, itemId) => {
    if (!confirm(`هل أنت متأكد من حذف هذا ${type}؟`)) return;
    try {
      let endpoint = `/students/${studentId}`;
      const item = findItemInStudent(student, type, itemId);

      switch (type) {
        case 'badge':
          endpoint += `/badges/${itemId}`;
          break;
        case 'month':
          endpoint += `/months/${itemId}`;
          break;
        case 'week':
          endpoint += `/months/${item.monthId}/weeks/${itemId}`;
          break;
        case 'day':
          endpoint += `/months/${item.monthId}/weeks/${item.weekId}/days/${itemId}`;
          break;
        default:
          return;
      }

      const res = await deleteData(endpoint);
      if (res.success) {
        toast.success('تم الحذف بنجاح 🗑️');
        await fetchStudentData();
      } else {
        toast.error('فشل الحذف');
      }
    } catch (error) {
      toast.error('خطأ في الحذف ❌');
    }
  };

  // Sync form values when modal opens
  useEffect(() => {
    if (showModal) {
      Object.keys(formData).forEach(key => setValue(key, formData[key]));
    }
  }, [showModal, formData, setValue]);

  // Academic Summary Component
  const AcademicSummary = ({ months }) => {
    if (!months?.length) return <span className="text-sm text-slate-500">لا توجد بيانات</span>;

    const totalDays = months.reduce(
      (acc, m) => acc + (m.weeks?.reduce((wacc, w) => wacc + (w.days?.length || 0), 0) || 0),
      0
    );

    const avgRating = months.reduce(
      (acc, m) => {
        m.weeks?.forEach(w => w.days?.forEach(d => {
          if (d.dailyRatings) {
            acc.total += d.dailyRatings.assignments + d.dailyRatings.participation + d.dailyRatings.performance;
            acc.count += 3;
          }
        }));
        return acc;
      },
      { total: 0, count: 0 }
    );

    const avg = avgRating.count ? (avgRating.total / avgRating.count).toFixed(1) : 0;

    const getScoreColor = (score) => {
      if (score >= 8) return 'from-emerald-500 to-teal-600 shadow-emerald-200';
      if (score >= 6) return 'from-blue-500 to-indigo-600 shadow-blue-200';
      return 'from-rose-500 to-red-600 shadow-rose-200';
    };

    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-slate-600">{months.length} شهر</span>
        <span className="text-sm text-slate-600">{totalDays} يوم</span>
        <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${getScoreColor(avg)} shadow-sm flex items-center justify-center text-white text-sm font-bold`}>
          {avg}
        </div>
      </div>
    );
  };

  // Badges List Component (Premium Cards)
  const BadgesList = ({ badges }) => (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-6 mb-8 shadow-lg">
      <div className="flex justify-between items-center mb-6 border-b pb-3 border-slate-100">
        <h4 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-amber-500 text-lg">🏅</span>
          <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">الإنجازات</span>
        </h4>
        <button
          onClick={() => openModal('createBadge')}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
        >
          + إضافة شارة
        </button>
      </div>
      {!badges?.length ? (
        <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <p className="text-lg">لا توجد إنجازات بعد</p>
          <p className="text-sm mt-1 opacity-70">أضف شارة لتحفيز الطالب</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {badges.map(b => (
            <div
              key={b._id}
              className="group p-5 border border-slate-200/60 rounded-xl bg-gradient-to-br from-white to-slate-50 hover:shadow-xl hover:border-slate-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-4xl transform group-hover:scale-105 transition">{b.icon}</div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">{b.name}</h5>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">{b.description}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatDate(b.earnedDate)}</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex flex-col space-y-1 mr-1">
                  <button
                    onClick={() => openModal('editBadge', b)}
                    className="text-xs px-2 py-1 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete('badge', b._id)}
                    className="text-xs px-2 py-1 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ✅ Premium Collapsible Table: Months → Weeks → Days
  const AcademicDetails = ({ months }) => {
    const toggleRow = (type, id) => {
      setOpenRows(prev => ({
        ...prev,
        [`${type}_${id}`]: !prev[`${type}_${id}`]
      }));
    };

    if (!months?.length) {
      return (
        <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
          <p className="text-xl text-slate-600 mb-4">لا توجد بيانات أكاديمية بعد</p>
          <p className="text-sm text-slate-500 mb-6">ابدأ بإنشاء أول شهر دراسي</p>
          <button
            onClick={() => openModal('createMonth')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition"
          >
            + إنشاء أول شهر
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200/70 shadow-lg bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-800 text-sm font-semibold">
            <tr>
              <th className="py-4 px-6 text-right rounded-tl-lg">الشهر / الأسبوع / اليوم</th>
              <th className="py-4 px-6 text-right">التاريخ</th>
              <th className="py-4 px-6 text-right">التقييم</th>
              <th className="py-4 px-6 text-right rounded-tr-lg">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {months.map((month) => (
              <React.Fragment key={month._id}>
                {/* Month Row */}
                <tr
                  className="bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                  onClick={() => toggleRow('month', month._id)}
                >
                  <td className="py-4 px-6 font-semibold text-slate-800 flex items-center gap-3">
                    <span
                      className={`inline-block transition-transform text-blue-600 ${
                        openRows[`month_${month._id}`] ? 'rotate-90' : ''
                      }`}
                    >
                      ▶
                    </span>
                    <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent font-bold">
                       - ({month.monthNumber}) - {month.monthName} 
                    </span>
                    <span className="text-slate-500 text-sm font-normal">{month.year}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-600">-</td>
                  <td className="py-4 px-6 text-slate-600">-</td>
                  <td className="py-4 px-6 text-sm space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal('createWeek', { monthId: month._id });
                      }}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200 transition"
                    >
                      + أسبوع
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal('editMonth', month);
                      }}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs hover:bg-slate-200 transition"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete('month', month._id);
                      }}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200 transition"
                    >
                      حذف
                    </button>
                  </td>
                </tr>

                {/* Weeks */}
                {openRows[`month_${month._id}`] &&
                  month.weeks?.map((week) => (
                    <React.Fragment key={week._id}>
                      <tr
                        className="bg-white hover:bg-slate-50 cursor-pointer"
                        onClick={() => toggleRow('week', week._id)}
                      >
                        <td className="py-3 px-6 pr-10 text-slate-800 flex items-center gap-2">
                          <span
                            className={`inline-block transition-transform text-blue-600 ${
                              openRows[`week_${week._id}`] ? 'rotate-90' : ''
                            }`}
                          >
                            ▶
                          </span>
                          <span>الأسبوع {week.weekNumber}</span>
                        </td>
                        <td className="py-3 px-6 text-slate-600 text-sm">
                          {formatDate(week.startDate)} → {formatDate(week.endDate)}
                        </td>
                        <td className="py-3 px-6 text-slate-600">-</td>
                        <td className="py-3 px-6 text-sm space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal('createDay', { monthId: month._id, weekId: week._id });
                            }}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200 transition"
                          >
                            + يوم
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal('editWeek', { ...week, monthId: month._id });
                            }}
                            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs hover:bg-slate-200 transition"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete('week', week._id);
                            }}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200 transition"
                          >
                            حذف
                          </button>
                        </td>
                      </tr>

                      {/* Days */}
                      {openRows[`week_${week._id}`] &&
                        week.days?.map((day) => {
                          const rating = day.dailyRatings;
                          return (
                            <tr key={day._id} className="bg-slate-50 hover:bg-slate-100 transition-colors">
                              <td className="py-3 px-6 pr-14 font-medium text-slate-800">{day.dayName}</td>
                              <td className="py-3 px-6 text-slate-600">{formatDate(day.date)}</td>
                              <td className="py-3 px-6 text-sm">
                                {rating ? (
                                  <div className="space-y-1">
                                    <div className="flex gap-2 text-xs">
                                      <span className="text-slate-700">واجبات:</span>
                                      <span className="font-medium">{rating.assignments}/10</span>
                                    </div>
                                    <div className="flex gap-2 text-xs">
                                      <span className="text-slate-700">مشاركة:</span>
                                      <span className="font-medium">{rating.participation}/10</span>
                                    </div>
                                    <div className="flex gap-2 text-xs">
                                      <span className="text-slate-700">أداء:</span>
                                      <span className="font-medium">{rating.performance}/10</span>
                                    </div>
                                    <div className="flex gap-2 text-xs">
                                      <span className="text-slate-700">اداء الواجب:</span>
                                      <span>{rating.assignmentstuts ? '✅' : '❌'}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-sm">لا يوجد تقييم</span>
                                )}
                              </td>
                              <td className="py-3 px-6 text-sm space-x-2">
                                <button
                                  onClick={() => openModal('editDay', { ...day, monthId: month._id, weekId: week._id })}
                                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200 transition"
                                >
                                  تعديل
                                </button>
                                <button
                                  onClick={() => openModal('editRating', { ...rating, monthId: month._id, weekId: week._id, _id: day._id })}
                                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs hover:bg-green-200 transition"
                                >
                                  تقييم
                                </button>
                                <button
                                  onClick={() => handleDelete('day', day._id)}
                                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200 transition"
                                >
                                  حذف
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ✅ Premium Modal
  const Modal = () => {
    if (!showModal) return null;
    const titles = {
      createBadge: 'إضافة شارة جديدة',
      editBadge: 'تعديل الشارة',
      createMonth: 'إنشاء شهر',
      editMonth: 'تعديل الشهر',
      createWeek: 'إضافة أسبوع',
      editWeek: 'تعديل الأسبوع',
      createDay: 'إضافة يوم',
      editDay: 'تعديل اليوم',
      editRating: 'تحديث التقييم اليومي'
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeModal}></div>
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all animate-in fade-in scale-in-95 duration-200">
          <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white px-6 py-5 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{titles[modalType]}</h3>
              <button onClick={closeModal} className="text-white/80 hover:text-white text-xl transition">×</button>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            {modalType.includes('Badge') && (
              <>
                <input {...register('name')} placeholder="اسم الشارة" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                <textarea {...register('description')} placeholder="الوصف" className="w-full p-3 border border-slate-300 rounded-xl" rows="2"></textarea>
                <input {...register('icon')} placeholder="أيقونة (مثلاً 🏆)" className="w-full p-3 border border-slate-300 rounded-xl" />
              </>
            )}
            {modalType.includes('Month') && (
              <>
                <select {...register('monthName')} className="w-full p-3 border border-slate-300 rounded-xl">
                  <option value="">اختر الشهر</option>
                  {MONTH_OPTIONS.map((name, i) => (
                    <option key={i} value={name}>{name}</option>
                  ))}
                </select>
                <input {...register('monthNumber')} type="number" placeholder="رقم الشهر" className="w-full p-3 border border-slate-300 rounded-xl" />
                <input {...register('year')} type="number" placeholder="السنة" className="w-full p-3 border border-slate-300 rounded-xl" />
              </>
            )}
            {modalType.includes('Week') && (
              <>
                <input {...register('weekNumber')} type="number" placeholder="رقم الأسبوع" className="w-full p-3 border border-slate-300 rounded-xl" />
                <input {...register('startDate')} type="date" className="w-full p-3 border border-slate-300 rounded-xl" />
                <input {...register('endDate')} type="date" className="w-full p-3 border border-slate-300 rounded-xl" />
              </>
            )}
            {modalType.includes('Day') && (
              <>
                <input {...register('dayNumber')} type="number" placeholder="رقم اليوم" className="w-full p-3 border border-slate-300 rounded-xl" />
                <select {...register('dayName')} className="w-full p-3 border border-slate-300 rounded-xl">
                  <option value="">اختر يوم</option>
                  {['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <input {...register('date')} type="date" className="w-full p-3 border border-slate-300 rounded-xl" />
              </>
            )}
            {modalType === 'editRating' && (
              <>
                <input {...register('assignments')} type="number" min="0" max="10" placeholder="الواجبات (0-10)" className="w-full p-3 border border-slate-300 rounded-xl" />
                <input {...register('participation')} type="number" min="0" max="10" placeholder="المشاركة (0-10)" className="w-full p-3 border border-slate-300 rounded-xl" />
                <input {...register('performance')} type="number" min="0" max="10" placeholder="الأداء (0-10)" className="w-full p-3 border border-slate-300 rounded-xl" />
                <label className="flex items-center space-x-3">
                  <input {...register('assignmentstuts')} type="checkbox" className="w-5 h-5 accent-blue-600" />
                  <span className="text-sm text-slate-700">اكتمل الاداء الواجب</span>
                </label>
              </>
            )}
            <div className="flex space-x-3 pt-5 border-t border-slate-200">
              <button type="button" onClick={closeModal} className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition">إلغاء</button>
              <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-md">
                {modalType.startsWith('create') ? 'إنشاء' : 'تحديث'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-6 shadow-lg"></div>
          <p className="text-xl text-slate-600 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600 text-xl">الطالب غير موجود</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/60 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="text-4xl">🎓</span>
            <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">إدارة الطالب</span>
          </h1>
          <p className="text-slate-600 mt-1">تتبع التقدم، الشارات، والجدول الأكاديمي بدقة</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          {/* Student Header */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 text-white p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <img
                src={student.Image?.trim() || 'https://via.placeholder.com/96/6B7280/FFFFFF?text=👤'}
                alt={student.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-2xl"
              />
              <div className="mr-5">
  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
    {student.name}
  </h1>
  <p className="text-gray-600 dark:text-gray-300">📧 {student.email}</p>
  <p className="text-gray-600 dark:text-gray-300">📞 {student.phone}</p>
  <p
    className="text-sm font-mono text-blue-700 dark:text-blue-300 cursor-pointer hover:underline font-medium"
    onClick={(e) => {
      e.stopPropagation(); // Prevent triggering parent click
      navigator.clipboard
        .writeText(student.studentCode)
        .then(() => {
          toast.success(`تم نسخ رمز الطالب: ${student.name}`);
        })
        .catch((err) => {
          console.error("فشل نسخ رمز الطالب", err);
          alert("فشل نسخ رمز الطالب");
        });
    }}
    title="انقر لنسخ رمز الطالب"
  >
  code:<span className="font-bold">{student.studentCode}</span>
  </p>
</div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-10">
            {/* Summary & Action */}
            <div className="flex flex-wrap items-center justify-between gap-6 border-b pb-6 border-slate-200">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">ملخص التقدم</h3>
                <AcademicSummary months={student.months} />
              </div>
              <button
                onClick={() => openModal('createMonth')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl text-sm font-medium shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
              >
                + شهر جديد
              </button>
            </div>

            {/* Badges */}
            <BadgesList badges={student.badges} />

            {/* Academic Table */}
            <AcademicDetails months={student.months} />
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal />
    </div>
  );
};

export default StudentsTables;