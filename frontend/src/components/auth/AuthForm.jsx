import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const AuthForm = ({ initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    // Clear error when user types
    if (errors[e.target.id]) {
      setErrors({ ...errors, [e.target.id]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { name: formData.fullName, email: formData.email, password: formData.password };

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.message || "Authentication failed" });
        return;
      }

      const responseData = data; // IMPORTANT: do NOT use data.data

      console.log("LOGIN RESPONSE:", responseData);

      // Validate token
      if (!responseData?.accessToken) {
        console.error("❌ Token missing in response");
        return;
      }

      // Create payload
      const authPayload = {
        token: responseData.accessToken,
        accessToken: responseData.accessToken,
        refreshToken: responseData.refreshToken,
        user: responseData.user,
      };

      // Store in localStorage BEFORE navigation
      localStorage.setItem("proofnexa_auth", JSON.stringify(authPayload));
      localStorage.setItem("proofnexa_user", JSON.stringify(responseData.user));

      // Debug log
      console.log("STORED AUTH:", localStorage.getItem("proofnexa_auth"));

      // Navigate AFTER storing
      navigate("/dashboard");
    } catch (err) {
      console.error("Auth error:", err);
      setErrors({ submit: "Connection to server failed. Make sure backend is running." });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="text-slate-400">
          {isLogin ? 'Enter your details to access your account' : 'Start verifying document originality today'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <Input 
              id="fullName"
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              className="pl-10 !bg-[#0B1020]/70 !border-white/10 !text-slate-100 placeholder:!text-slate-500 focus:!border-brand-purple focus:!ring-brand-purple/20"
            />
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <Input 
            id="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            className="pl-10 !bg-[#0B1020]/70 !border-white/10 !text-slate-100 placeholder:!text-slate-500 focus:!border-brand-purple focus:!ring-brand-purple/20"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input 
            id="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            className="pl-10 !bg-[#0B1020]/70 !border-white/10 !text-slate-100 placeholder:!text-slate-500 focus:!border-brand-purple focus:!ring-brand-purple/20"
          />
        </div>

        {!isLogin && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input 
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              className="pl-10 !bg-[#0B1020]/70 !border-white/10 !text-slate-100 placeholder:!text-slate-500 focus:!border-brand-purple focus:!ring-brand-purple/20"
            />
          </div>
        )}

        {isLogin && (
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
              Remember me
            </label>
          </div>
        )}

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm py-2 px-4 rounded-lg text-center">
            {errors.submit}
          </div>
        )}

        <Button type="submit" variant="primary" className="w-full">
          {isLogin ? 'Sign In' : 'Create Account'}
        </Button>
      </form>



      <p className="mt-8 text-center text-sm text-slate-400">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="font-medium text-brand-purple hover:text-brand-light"
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;
