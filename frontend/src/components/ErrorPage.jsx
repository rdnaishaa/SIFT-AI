const ErrorPage = () => {
  return (
    <div className="min-h-screen bg-[#0F1113] text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Oops!</h1>
      <p className="text-gray-400 mb-8">Halaman tidak ditemukan</p>
      <button
        onClick={() => (window.location.href = "/dashboard")}
        className="px-4 py-2 bg-[#5B9FED] text-white rounded-lg hover:bg-[#4A8DD9]"
      >
        Kembali ke Dashboard
      </button>
    </div>
  );
};

export default ErrorPage;
