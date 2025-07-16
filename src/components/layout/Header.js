function Header({ toggleSidebar }) {
  return (
    <header
      className="text-white border-b-[2px] border-gray-200 p-4 shadow-lg"
      style={{
        background: "linear-gradient(90deg, #0072FF 0%, #0C79FF 100%)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-md transition-colors"
            style={{
              background: "rgba(0, 114, 255, 0.15)",
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold tracking-wide" style={{ color: "#e0e7ef" }}>
            Astro
          </h1>
        </div>
      

        <div className="flex items-center space-x-4">
          <button
            className="px-4 py-2 rounded-md transition-colors font-semibold"
            style={{
              background: "linear-gradient(90deg, #0072FF 0%, #0C79FF 100%)",
              color: "#fff",
              boxShadow: "0 2px 8px 0 rgba(0,114,255,0.10)",
            }}
          >
            Login
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;