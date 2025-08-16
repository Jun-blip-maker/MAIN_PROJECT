import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DelegateReg = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    emailOrPhone: "",
    registrationNumber: "",
    password: "",
    confirmPassword: "",
    school: "",
    isCandidate: true,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8)
      errors.push("Password must be at least 8 characters");
    if (!/[A-Z]/.test(password))
      errors.push("Password must contain at least one uppercase letter");
    if (!/[a-z]/.test(password))
      errors.push("Password must contain at least one lowercase letter");
    if (!/[0-9]/.test(password))
      errors.push("Password must contain at least one number");
    if (!/[^A-Za-z0-9]/.test(password))
      errors.push("Password must contain at least one special character");
    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "password") {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    // Validate password strength
    const errors = validatePassword(formData.password);
    if (errors.length > 0) {
      setError("Password doesn't meet requirements");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/register", {
        fullName: formData.fullName,
        emailOrPhone: formData.emailOrPhone,
        registrationNumber: formData.registrationNumber,
        password: formData.password,
        school: formData.school,
        isCandidate: formData.isCandidate,
      });

      setSuccess(true);
      setError("");

      // Redirect to sign-in page after 2 seconds
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
            Delegate Register Form
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded">{error}</div>
        )}

        {success && (
          <div className="bg-green-100 text-green-800 p-3 rounded">
            Registration successful! Redirecting to sign-in page...
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="emailOrPhone"
                className="block text-sm font-medium text-gray-700"
              >
                Email or Phone
              </label>
              <input
                id="emailOrPhone"
                name="emailOrPhone"
                type="text"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your email or phone"
                value={formData.emailOrPhone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="registrationNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Registration Number
              </label>
              <input
                id="registrationNumber"
                name="registrationNumber"
                type="text"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your registration number"
                value={formData.registrationNumber}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="school"
                className="block text-sm font-medium text-gray-700"
              >
                School
              </label>
              <select
                id="school"
                name="school"
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={formData.school}
                onChange={handleChange}
              >
                <option value="">Select your school</option>
                <option value="School of Business and Economics">
                  Business and Economics
                </option>
                <option value="School of Pure and Applied Science">
                  Pure and Applied Science
                </option>
                <option value="School of Education Arts">Education Arts</option>
                <option value="School of Education Science">
                  Education Science
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              {passwordErrors.length > 0 && (
                <div className="mt-1 text-xs text-red-600">
                  <ul className="list-disc pl-5">
                    {passwordErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="isCandidate"
              name="isCandidate"
              type="checkbox"
              checked={formData.isCandidate}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isCandidate"
              className="ml-2 block text-sm text-gray-900"
            >
              Register as a candidate
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={passwordErrors.length > 0}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                passwordErrors.length > 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DelegateReg;
