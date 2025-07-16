function Footer() {
  return (
    <footer
      className="p-6 mt-auto"
      style={{
        background: "linear-gradient(90deg, #0072FF 0%, #0C79FF 100%)",
        color: "#fff",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center text-[#e0e7ef]">
          <p>&copy; 2024 Astro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;