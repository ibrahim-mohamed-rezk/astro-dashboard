export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-sans bg-white dark:bg-black">
      <div className="flex flex-col items-center gap-6">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-4"
        >
          <circle cx="40" cy="40" r="40" fill="#F3F4F6" />
          <path
            d="M40 20V44"
            stroke="#A3A3A3"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="40" cy="58" r="3" fill="#A3A3A3" />
        </svg>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Coming Soon
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center max-w-md">
          We're working hard to bring you something amazing.<br />
          Please check back soon!
        </p>
      </div>
    </div>
  );
}
