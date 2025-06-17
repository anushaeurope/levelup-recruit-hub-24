
import React, { useState } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    workingHours: '',
    weeklyAvailability: '',
    whyThisRole: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.workingHours) newErrors.workingHours = 'Preferred working hours is required';
    if (!formData.weeklyAvailability) newErrors.weeklyAvailability = 'Weekly availability is required';
    
    if (!formData.whyThisRole.trim()) {
      newErrors.whyThisRole = 'Please tell us why you want this role';
    } else if (formData.whyThisRole.trim().length < 50) {
      newErrors.whyThisRole = 'Please provide at least 50 characters explaining why you want this role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkDuplicateEmail = async (email: string) => {
    const q = query(collection(db, 'applicants'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check for duplicate email
      const isDuplicate = await checkDuplicateEmail(formData.email);
      if (isDuplicate) {
        setErrors({ email: 'This email has already been registered' });
        toast({
          title: "Email Already Registered",
          description: "This email address has already been used for registration",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Add to Firestore
      await addDoc(collection(db, 'applicants'), {
        ...formData,
        status: 'New',
        salesCompleted: 0,
        submittedAt: new Date(),
        createdAt: new Date().toISOString()
      });

      setShowSuccess(true);
      toast({
        title: "Application Submitted!",
        description: "Thank you for applying! Our team will reach out within 24 hours via WhatsApp.",
      });

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        workingHours: '',
        weeklyAvailability: '',
        whyThisRole: ''
      });

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 10);
  };

  if (showSuccess) {
    return (
      <section id="registration-form" className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/20 rounded-2xl p-12 animate-scale-in">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Application Submitted Successfully!</h2>
              <p className="text-gray-300 text-lg mb-8">
                Thank you for applying! Our team will reach out within 24 hours via WhatsApp.
              </p>
              <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
                <p className="text-blue-300 font-medium">Join our official jobs channel for updates:</p>
                <a 
                  href="https://t.me/ManaClg_LevelUp_Jobs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-full hover:scale-105 transition-transform duration-300"
                >
                  Join Telegram Channel →
                </a>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="registration-form" className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
              Start Your SRM Journey
            </h2>
            <p className="text-xl text-gray-300 animate-fade-in-delay">
              Fill out the form below to join our exclusive Student Relationship Manager program
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 md:p-12 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      errors.fullName ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      errors.email ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setFormData(prev => ({ ...prev, phone: formatted }));
                      if (errors.phone) {
                        setErrors(prev => ({ ...prev, phone: '' }));
                      }
                    }}
                    className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      errors.phone ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="WhatsApp preferred"
                    maxLength={10}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs">WhatsApp number preferred for quick communication</p>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-300">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      errors.city ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Your current city"
                  />
                  {errors.city && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* Working Hours */}
                <div className="space-y-2">
                  <label htmlFor="workingHours" className="block text-sm font-medium text-gray-300">
                    Preferred Working Hours *
                  </label>
                  <select
                    id="workingHours"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      errors.workingHours ? 'border-red-500' : 'border-gray-600'
                    }`}
                  >
                    <option value="">Select your preferred time</option>
                    <option value="Morning">Morning (9 AM - 1 PM)</option>
                    <option value="Afternoon">Afternoon (1 PM - 5 PM)</option>
                    <option value="Evening">Evening (5 PM - 9 PM)</option>
                  </select>
                  {errors.workingHours && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.workingHours}
                    </p>
                  )}
                </div>

                {/* Weekly Availability */}
                <div className="space-y-2">
                  <label htmlFor="weeklyAvailability" className="block text-sm font-medium text-gray-300">
                    Weekly Availability *
                  </label>
                  <select
                    id="weeklyAvailability"
                    name="weeklyAvailability"
                    value={formData.weeklyAvailability}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                      errors.weeklyAvailability ? 'border-red-500' : 'border-gray-600'
                    }`}
                  >
                    <option value="">Select your availability</option>
                    <option value="12 hrs">12 hours/week (Minimum)</option>
                    <option value="20 hrs">20 hours/week</option>
                    <option value="30+ hrs">30+ hours/week</option>
                  </select>
                  {errors.weeklyAvailability && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.weeklyAvailability}
                    </p>
                  )}
                </div>
              </div>

              {/* Why This Role */}
              <div className="space-y-2">
                <label htmlFor="whyThisRole" className="block text-sm font-medium text-gray-300">
                  Why do you want this role? *
                </label>
                <textarea
                  id="whyThisRole"
                  name="whyThisRole"
                  value={formData.whyThisRole}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none ${
                    errors.whyThisRole ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Tell us why you're interested in this SRM position and what makes you a good fit... (minimum 50 characters)"
                />
                <div className="flex justify-between items-center">
                  {errors.whyThisRole && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.whyThisRole}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs ml-auto">
                    {formData.whyThisRole.length}/50 characters minimum
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                      Submit Application
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationForm;
