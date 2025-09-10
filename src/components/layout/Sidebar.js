import Link from "next/link";

function Sidebar({ isOpen, closeSidebar }) {
  const navs = [
    {
      label: "Dashboard",
      href: "/",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="#B3D1FF"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
        </svg>
      ),
    },
    {
      label: "Students",
      href: "/users",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="#B3D1FF"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
        </svg>
      ),
    },
    {
      label: "Best Students",
      href: "/best-students",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="#B3D1FF"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
        </svg>
      ),
    },
    {
      label: "Months",
      href: "/months",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="#B3D1FF"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
        </svg>
      ),
    },
    {
      label: "Weeks",
      href: "/weeks",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="#B3D1FF"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
        </svg>
      ),
    },
    {
      label: "days",
      href: "/days",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="#B3D1FF"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
        </svg>
      ),
    },
    {
      label: "Badges",
      href: "/badges",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="#B3D1FF"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#00000093] bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 text-white transform transition-transform duration-300 ease-in-out
         
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        md:block
      `}
        style={{
          background: "linear-gradient(180deg, #0072FF 0%, #0C79FF 100%)",
        }}
      >
        <div className="p-4">
          <nav className="space-y-2">
            {navs.map((item, idx) => (
              <Link
                key={item.label}
                href={item.href}
                className="block py-2 px-3 rounded-md transition-colors font-medium border border-transparent hover:border-blue-300"
                style={{ color: "#e0e7ef" }}
              >
                <span className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
