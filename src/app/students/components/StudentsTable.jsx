import { deleteData } from "@/libs/axios/server";

const StudentsTable = ({ students, onEdit, feachData }) => {
  const getAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return "N/A";
    const avg =
      ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return avg.toFixed(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const deleteStudent = async (id) => {
    try {
      await deleteData(
        `/students/${id}`,
        {},
        {
          Authorization: `Bearer token`,
          "Content-Type": "multipart/form-data",
        }
      );

      feachData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.msg || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
      throw error;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#0072FF] to-[#0C79FF] text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Photo
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Student Code
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Phone
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Badges
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Rating
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Created
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student, index) => (
              <tr
                key={student._id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onView(student._id)}
              >
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <img
                    src={student.photo}
                    alt={student.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        student.name
                      )}&background=0072FF&color=fff&size=128`;
                    }}
                  />
                </td>
                <td className="px-6 py-4">
                  <span className="text-[#0072FF] font-mono font-semibold">
                    {student.studentCode}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {student.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-600">{student.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-600">{student.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {student.badges.length > 0 ? (
                      student.badges.map((badge, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 text-xs font-medium bg-[#0072FF] text-white rounded-full"
                        >
                          {badge}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No badges</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="font-medium">
                      {getAverageRating(student.ratings)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-600 text-sm">
                    {formatDate(student.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onEdit(student)}
                      className="p-2 text-[#0072FF] hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit Student"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteStudent(student._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Student"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
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
  );
};

export default StudentsTable;
