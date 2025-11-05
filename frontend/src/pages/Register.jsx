import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== retypePassword) {
      alert('Passwords do not match!');
      return;
    }
    if (!acceptTerms) {
      alert('Please accept the terms and conditions');
      return;
    }
    // Here you would typically handle the registration
    navigate('/login');
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

      {/* Right side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#1B201A]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Let's Create an Account!</h2>
            <p className="text-gray-400">Welcome</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md bg-[#1B201A] border border-[#73B2FF]/30 text-white px-4 py-2 focus:border-[#73B2FF] focus:ring-1 focus:ring-[#73B2FF]"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md bg-[#1B201A] border border-[#73B2FF]/30 text-white px-4 py-2 focus:border-[#73B2FF] focus:ring-1 focus:ring-[#73B2FF]"
                placeholder="Choose a username"
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
                className="mt-1 block w-full rounded-md bg-[#1B201A] border border-[#73B2FF]/30 text-white px-4 py-2 focus:border-[#73B2FF] focus:ring-1 focus:ring-[#73B2FF]"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="retypePassword" className="block text-sm font-medium text-gray-300">
                Re-type Password
              </label>
              <input
                id="retypePassword"
                type="password"
                required
                value={retypePassword}
                onChange={(e) => setRetypePassword(e.target.value)}
                className="mt-1 block w-full rounded-md bg-[#1B201A] border border-[#73B2FF]/30 text-white px-4 py-2 focus:border-[#73B2FF] focus:ring-1 focus:ring-[#73B2FF]"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#73B2FF] focus:ring-[#73B2FF]"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                I have read and agree to the{' '}
                <a href="#" className="text-[#73B2FF] hover:text-[#73B2FF]/80">
                  terms
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#73B2FF] hover:text-[#73B2FF]/80">
                  conditions
                </a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#73B2FF] hover:bg-[#73B2FF]/80 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-6 text-center text-gray-400">
            <span>Already have an account? </span>
            <Link to="/login" className="text-[#73B2FF] hover:text-[#73B2FF]/80">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;