import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== retypePassword) {
      const message = "Passwords do not match!";
      setErrorMessage(message);
      toast.error(message);
      return;
    }
    if (!acceptTerms) {
      const message = "Please accept the terms and conditions";
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      const message = err.message || "Registration failed. Please try again.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Logo and Gradient Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#73B2FF] to-[#1B201A] justify-center items-center">
        <div className="text-white text-center">
          <img
            src="/SIFT no BG.png"
            alt="SIFT Logo"
            className="h-24 mx-auto mb-6"
          />
          <p className="text-xl">Welcome to SIFT AI Platform</p>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#1B201A]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Let's Create an Account!
            </h2>
            <p className="text-gray-400">Welcome</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-md text-sm">
                {errorMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="mt-1 block w-full rounded-md bg-[#1B201A] border border-[#73B2FF]/30 text-white px-4 py-2 focus:border-[#73B2FF] focus:ring-1 focus:ring-[#73B2FF] disabled:opacity-50"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="mt-1 block w-full rounded-md bg-[#1B201A] border border-[#73B2FF]/30 text-white px-4 py-2 focus:border-[#73B2FF] focus:ring-1 focus:ring-[#73B2FF] disabled:opacity-50"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="mt-1 block w-full rounded-md bg-[#1B201A] border border-[#73B2FF]/30 text-white px-4 py-2 focus:border-[#73B2FF] focus:ring-1 focus:ring-[#73B2FF] disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label
                htmlFor="retypePassword"
                className="block text-sm font-medium text-gray-300"
              >
                Re-type Password
              </label>
              <input
                id="retypePassword"
                type="password"
                required
                value={retypePassword}
                onChange={(e) => setRetypePassword(e.target.value)}
                disabled={loading}
                className="mt-1 block w-full rounded-md bg-[#1B201A] border border-[#73B2FF]/30 text-white px-4 py-2 focus:border-[#73B2FF] focus:ring-1 focus:ring-[#73B2FF] disabled:opacity-50"
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
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-300"
              >
                I have read and agree to the{" "}
                <a href="#" className="text-[#73B2FF] hover:text-[#73B2FF]/80">
                  terms
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#73B2FF] hover:text-[#73B2FF]/80">
                  conditions
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#73B2FF] hover:bg-[#73B2FF]/80 text-white font-semibold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-400">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="text-[#73B2FF] hover:text-[#73B2FF]/80"
            >
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
