"use client";

import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />

        <div className="flex flex-col flex-1 md:ml-0">
          <main className="flex-1 min-h-screen overflow-y-auto">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
