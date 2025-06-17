
import React, { useState } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Send, CheckCircle, AlertCircle, User, Mail, Phone, MapPin } from 'lucide-react';
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
    } else if (formData.whyThisRole.trim().length < 100) {
      newErrors.whyThisRole = 'Please provide at least 100 characters explaining why you want this role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkDuplicateEmail = async (email: string) => {
    const q = query(collection(db, 'applicants'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const checkDuplicatePhone = async (phone: string) => {
    const q = query(collection(db, 'applicants'), where('phone', '==', phone));
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
      const isDuplicateEmail = await checkDuplicateEmail(formData.email);
      if (isDuplicateEmail) {
        setErrors({ email: 'This email has already been registered' });
        toast({
          title: "Email Already Registered",
          description: "This email address has already been used for registration",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Check for duplicate phone
      const isDuplicatePhone = await checkDuplicatePhone(formData.phone);
      if (isDuplicatePhone) {
        setErrors({ phone: 'This phone number has already been registered' });
        toast({
          title: "Phone Already Registered",
          description: "This phone number has already been used for registration",
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
      <section id="registration-form" className="py-20 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="professional-card p-12 animate-fade-in-up">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h2>
              <p className="text-gray-600 text-lg mb-8">
                Thanks for registering! Our team will reach you within 24 hours via WhatsApp.
              </p>
              <button
                onClick={() => setShowSuccess(false)}
                className="btn-secondary"
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
    <section id="registration-form" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 animate-fade-in-up">
              Apply to Become an SRM
            </h2>
            <p className="text-xl text-gray-600 animate-fade-in-up-delay">
              Join our team of Student Relationship Managers and start your professional journey
            </p>
          </div>

          <div className="professional-card p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="fullName" className="flex items-center text-sm font-semibold text-gray-700">
                    <User className="w-4 h-4 mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:input-focus transition-all duration-300 ${
                      errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:input-focus transition-all duration-300 ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="flex items-center text-sm font-semibold text-gray-700">
                    <Phone className="w-4 h-4 mr-2" />
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
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:input-focus transition-all duration-300 ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="WhatsApp preferred"
                    maxLength={10}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs">WhatsApp number preferred for quick communication</p>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label htmlFor="city" className="flex items-center text-sm font-semibold text-gray-700">
                    <MapPin className="w-4 h-4 mr-2" />
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:input-focus transition-all duration-300 ${
                      errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Your current city"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* Working Hours */}
                <div className="space-y-2">
                  <label htmlFor="workingHours" className="block text-sm font-semibold text-gray-700">
                    Preferred Work Hours *
                  </label>
                  <select
                    id="workingHours"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:input-focus transition-all duration-300 ${
                      errors.workingHours ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  >
                    <option value="">Select your preferred time</option>
                    <option value="Morning">Morning (9 AM - 1 PM)</option>
                    <option value="Afternoon">Afternoon (1 PM - 5 PM)</option>
                    <option value="Evening">Evening (5 PM - 9 PM)</option>
                  </select>
                  {errors.workingHours && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.workingHours}
                    </p>
                  )}
                </div>

                {/* Weekly Availability */}
                <div className="space-y-2">
                  <label htmlFor="weeklyAvailability" className="block text-sm font-semibold text-gray-700">
                    Weekly Availability *
                  </label>
                  <select
                    id="weeklyAvailability"
                    name="weeklyAvailability"
                    value={formData.weeklyAvailability}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl text-gray-900 focus:input-focus transition-all duration-300 ${
                      errors.weeklyAvailability ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  >
                    <option value="">Select your availability</option>
                    <option value="12 hrs">12 hours/week</option>
                    <option value="20 hrs">20 hours/week</option>
                    <option value="30 hrs">30 hours/week</option>
                  </select>
                  {errors.weeklyAvailability && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.weeklyAvailability}
                    </p>
                  )}
                </div>
              </div>

              {/* Why This Role */}
              <div className="space-y-2">
                <label htmlFor="whyThisRole" className="block text-sm font-semibold text-gray-700">
                  Why are you applying? *
                </label>
                <textarea
                  id="whyThisRole"
                  name="whyThisRole"
                  value={formData.whyThisRole}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:input-focus transition-all duration-300 resize-none ${
                    errors.whyThisRole ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Tell us why you're interested in this SRM position and what makes you a good fit... (minimum 100 characters)"
                />
                <div className="flex justify-between items-center">
                  {errors.whyThisRole && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.whyThisRole}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs ml-auto">
                    {formData.whyThisRole.length}/100 characters minimum
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Application
                    </>
                  )}
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
