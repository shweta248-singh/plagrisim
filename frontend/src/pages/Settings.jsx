import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { getMyProfile, updateMyProfile } from '../services/api';

const Settings = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

  // Load user data on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getMyProfile();
      if (res.success && res.user) {
        setFormData({
          name: res.user.name || '',
          email: res.user.email || '',
          phone: res.user.phone || '',
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setMessage({ type: 'error', text: 'Failed to load profile data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null);
  };

  const validateGeneral = () => {
    if (!formData.name.trim()) return 'Name is required.';
    if (!formData.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email address.';
    if (formData.phone && formData.phone.trim().length < 8) return 'Phone number is too short.';
    return null;
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validateGeneral();
    if (errorMsg) {
      setMessage({ type: 'error', text: errorMsg });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      const res = await updateMyProfile(formData);
      if (res.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        if (res.user?.name) {
          localStorage.setItem('proofnexa_user', res.user.name);
        }
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8 flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full bg-brand-purple text-white flex items-center justify-center text-2xl font-bold uppercase shadow-md">
          {formData.name ? formData.name.charAt(0) : 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{formData.name || 'User'}</h1>
          <p className="text-sm text-gray-500">{formData.email}</p>
        </div>
      </div>

      <div className="bg-[#111827]/80 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(124,58,237,0.12)] border border-white/10 overflow-hidden text-slate-100">
        <div className="p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-slate-100 mb-6 border-b border-white/10 pb-4">Profile Settings</h2>
            
            <form onSubmit={handleGeneralSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleGeneralChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleGeneralChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleGeneralChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-colors"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 bg-brand-purple hover:bg-brand-light text-white px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
