import { createBrowserRouter, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import DetailPage from '../pages/DetailPage';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Error Element Component
const ErrorPage = () => {
  return (
    <div className="min-h-screen bg-[#0F1113] text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Oops!</h1>
      <p className="text-gray-400 mb-8">Halaman tidak ditemukan</p>
      <button
        onClick={() => window.location.href = '/dashboard'}
        className="px-4 py-2 bg-[#5B9FED] text-white rounded-lg hover:bg-[#4A8DD9]"
      >
        Kembali ke Dashboard
      </button>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorPage />
  },
  {
    path: "/signup",
    element: <Register />,
    errorElement: <ErrorPage />
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
    errorElement: <ErrorPage />
  },
  {
    path: "/detail/*",  // Menggunakan * untuk menangkap semua path di bawah /detail/
    element: <ProtectedRoute><DetailPage /></ProtectedRoute>,
    errorElement: <ErrorPage />
  },
  {
    path: "*",  // Catch semua route yang tidak terdaftar
    element: <Navigate to="/" replace />
  }
]);

export default router;