import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin, useSession } from "../hooks";

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { refreshAuthState } = useSession();
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  // React Query hook
  const loginMutation = useLogin();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await loginMutation.mutateAsync(formData);

      if (response.success && response.token && response.user) {
        // Redirect to dashboard
        refreshAuthState();
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      // Error is handled by the mutation
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700 p-4">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md shadow-2xl border border-gray-700">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 text-white text-2xl font-bold rounded-full relative">
              M
              <span className="absolute -right-2 top-1/2 transform -translate-y-1/2 text-primary-500 text-lg">
                →
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-1">
            <span className="text-white">MoneyFlow</span>
          </h1>
          <p className="text-gray-400 text-xs tracking-wider">
            MONEY REMITTANCE
          </p>
        </div>

        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to MoneyFlow
          </h2>
          <p className="text-gray-400 text-sm">
            Enter Username and Password to login
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {loginMutation.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
              {loginMutation.error instanceof Error
                ? loginMutation.error.message
                : "Login failed. Please try again."}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white"
            >
              Username
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
              className="input-field w-full"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
              className="input-field w-full"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 text-primary-500 bg-gray-700 border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
            />
            <label
              htmlFor="remember"
              className="ml-2 text-sm text-white cursor-pointer"
            >
              Remember this Device
            </label>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="btn-primary w-full py-3 text-base"
          >
            {loginMutation.isPending ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
