import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle authentication
    // For now, we'll just simulate a login
    if (email && password) {
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Logo and Gradient Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#73B2FF] to-[#1B201A] justify-center items-center">
        <div className="text-white text-center">
          <img src="/SIFT no BG.png" alt="SIFT Logo" className="h-24 mx-auto mb-6" />
          <p className="text-xl">Welcome to SIFT AI Platform</p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#1B201A]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Login to Start Profiling</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white px-4 py-2"
                placeholder="name@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white px-4 py-2"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              Login
            </button>

            <div className="text-center">
              <Link to="#" className="text-sm text-blue-400 hover:text-blue-300">
                Forgot Password?
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center text-gray-400">
            <span>Don't Have an Account? </span>
            <Link to="/signup" className="text-blue-400 hover:text-blue-300">
              Sign up now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;