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
      href: "/students",
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
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
            d="M17 17v-4a2 2 0 00-2-2h-2V7a2 2 0 10-4 0v4H7a2 2 0 00-2 2v4l7 4 7-4z"
          />
          <circle
            cx="12"
            cy="9"
            r="2"
            stroke="#B3D1FF"
            strokeWidth={2}
            fill="none"
          />
        </svg>
      ),
    },
    // {
    //   label: "Settings",
    //   href: "/settings",
    //   icon: (
    //     <svg
    //       className="w-5 h-5"
    //       fill="none"
    //       stroke="#B3D1FF"
    //       viewBox="0 0 24 24"
    //     >
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    //       />
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    //       />
    //     </svg>
    //   ),
    // },
    // {
    //   label: "Analytics",
    //   href: "/analytics",
    //   icon: (
    //     <svg
    //       className="w-5 h-5"
    //       fill="none"
    //       stroke="#B3D1FF"
    //       viewBox="0 0 24 24"
    //     >
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    //       />
    //     </svg>
    //   ),
    // },
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
