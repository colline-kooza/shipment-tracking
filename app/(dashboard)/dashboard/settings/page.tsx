"use client";

import React, { useState, useEffect } from 'react';
import { Lock, User, Shield, Mail, Eye, EyeOff } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileSettingsData, updateProfileSettings, SecuritySettingsData, updateSecuritySettings } from '@/actions/settings';
import toast from 'react-hot-toast';

// Validation types
type ValidationErrors = {
  [key: string]: string;
};

type FormData = {
  profile: ProfileSettingsData;
  security: SecuritySettingsData;
};

const Settings: React.FC = () => {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Form data state
  const [formData, setFormData] = useState<FormData>({
    profile: {
      name: '',
      email: '',
      language: 'en',
      timeZone: 'UTC+3'
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      enableTwoFactor: false
    }
  });

  // Validation states
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Initialize form data when session is available
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        profile: {
          name: session.user.name || '',
          email: session.user.email || '',
          language: prev.profile.language,
          timeZone: prev.profile.timeZone
        }
      }));
    }
  }, [session]);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/\d/.test(password)) errors.push('Password must contain at least one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Password must contain at least one special character');
    return errors;
  };

  const validateProfileForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Name validation
    if (!formData.profile.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.profile.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.profile.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!validateEmail(formData.profile.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSecurityForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Current password validation
    if (!formData.security.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    // New password validation
    if (!formData.security.newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      const passwordErrors = validatePassword(formData.security.newPassword);
      if (passwordErrors.length > 0) {
        errors.newPassword = passwordErrors[0]; 
      }
    }

    // Confirm password validation
    if (!formData.security.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (formData.security.newPassword !== formData.security.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form field changes
  const handleProfileChange = (field: keyof ProfileSettingsData, value: string) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSecurityChange = (field: keyof SecuritySettingsData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: value
      }
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

 // In your Settings component, update the handleSubmit function:

const handleSubmit = async () => {
  try {
    setIsSubmitting(true);
    setValidationErrors({});

    if (activeTab === 'profile') {
      if (!validateProfileForm()) {
        toast.error('Please fix the validation errors');
        return;
      }

      const result = await updateProfileSettings(formData.profile);

      if (result.success) {
        // Trigger session update to fetch fresh data from the database
        await updateSession(); // This will trigger the JWT callback with trigger: "update"
        
        toast.success('Profile settings updated successfully');
        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to update profile settings');
      }
    } else if (activeTab === 'security') {
      if (!validateSecurityForm()) {
        toast.error('Please fix the validation errors');
        return;
      }

      const result = await updateSecuritySettings(formData.security);

      if (result.success) {
        toast.success('Security settings updated successfully');
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          security: {
            ...prev.security,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        }));
      } else {
        throw new Error(result.error || 'Failed to update security settings');
      }
    } else {
      toast.success("Only profile and security settings can be updated at this time");
    }
  } catch (error) {
    console.error('Settings update error:', error);
    toast.error(error instanceof Error ? error.message : 'Something went wrong');
  } finally {
    setIsSubmitting(false);
  }
};

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    value={formData.profile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className={`pl-10 block w-full rounded-md border shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      validationErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {validationErrors.name && (
                  <p className="text-red-600 text-sm">{validationErrors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className={`pl-10 block w-full rounded-md border shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      validationErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-red-600 text-sm">{validationErrors.email}</p>
                )}
              </div>
              
              {/* <div className="space-y-2 ">
                <label htmlFor="language" className="text-sm font-medium text-gray-700">Language</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="language"
                    value={formData.profile.language}
                    onChange={(e) => handleProfileChange('language', e.target.value)}
                    className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="ar">Arabic</option>
                    <option value="sw">Swahili</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2 ">
                <label htmlFor="timeZone" className="text-sm font-medium text-gray-700">Time Zone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="timeZone"
                    value={formData.profile.timeZone}
                    onChange={(e) => handleProfileChange('timeZone', e.target.value)}
                    className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="UTC+3">East Africa Time (UTC+3)</option>
                    <option value="UTC+2">Central Africa Time (UTC+2)</option>
                    <option value="UTC+1">West Africa Time (UTC+1)</option>
                    <option value="UTC+0">Greenwich Mean Time (UTC+0)</option>
                  </select>
                </div>
              </div> */}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={formData.security.currentPassword}
                        onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                        className={`pl-10 pr-10 block w-full rounded-md border shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                          validationErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {validationErrors.currentPassword && (
                      <p className="text-red-600 text-sm">{validationErrors.currentPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={formData.security.newPassword}
                        onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                        className={`pl-10 pr-10 block w-full rounded-md border shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                          validationErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {validationErrors.newPassword && (
                      <p className="text-red-600 text-sm">{validationErrors.newPassword}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={formData.security.confirmPassword}
                        onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                        className={`pl-10 pr-10 block w-full rounded-md border shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                          validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="text-red-600 text-sm">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Enable Two-Factor Authentication</span>
                      <p className="text-xs text-gray-500 mt-1">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.security.enableTwoFactor}
                      onChange={(e) => handleSecurityChange('enableTwoFactor', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div> */}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <Card className="overflow-hidden">
              <nav className="flex flex-col">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center px-4 py-3 text-sm transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-5 w-5 mr-3" />
                  Profile
                </button>
                {/* <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center px-4 py-3 text-sm transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Bell className="h-5 w-5 mr-3" />
                  Notifications
                </button> */}
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center px-4 py-3 text-sm transition-colors ${
                    activeTab === 'security'
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="h-5 w-5 mr-3" />
                  Security
                </button>
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="col-span-12 md:col-span-9">
            <Card>
              <div className="p-6">
                {renderContent()}
                <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || activeTab === 'notifications'}
                    className={`py-2 px-6 rounded-md font-medium transition-colors ${
                      isSubmitting || activeTab === 'notifications'
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;