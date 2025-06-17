import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Send, CheckCircle, AlertCircle, User, Mail, Phone, MapPin, Calendar, GraduationCap, Clock, Users, UserCheck, Briefcase } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    education: '',
    city: '',
    currentPosition: '',
    workingHours: '',
    weeklyAvailability: '',
    whyThisRole: '',
    reference: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [references, setReferences] = useState<string[]>([]);

  useEffect(() => {
    fetchReferences();
  }, []);

  const fetchReferences = async () => {
    try {
      // Fetch from agents collection instead of references
      const agentsSnapshot = await getDocs(collection(db, 'agents'));
      const referencesList = agentsSnapshot.docs.map(doc => doc.data().referenceLabel);
      
      // Also check references collection for backward compatibility
      const referencesSnapshot = await getDocs(collection(db, 'references'));
      const additionalRefs = referencesSnapshot.docs.map(doc => doc.data().name);
      
      // Combine and remove duplicates
      const allReferences = [...new Set([...referencesList, ...additionalRefs])];
      
      // Default references if none exist
      const defaultReferences = ['Govardhan', 'Srinu', 'Anand', 'Mario', 'Pradeep', 'ETHAN'];
      setReferences(allReferences.length > 0 ? allReferences : defaultReferences);
    } catch (error) {
      console.error('Error fetching references:', error);
      // Fallback to default references
      setReferences(['Govardhan', 'Srinu', 'Anand', 'Mario', 'Pradeep', 'ETHAN']);
    }
  };

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

    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 18 || Number(formData.age) > 65) {
      newErrors.age = 'Please enter a valid age between 18 and 65';
    }

    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.education) newErrors.education = 'Education qualification is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.currentPosition) newErrors.currentPosition = 'Current position is required';
    if (!formData.workingHours) newErrors.workingHours = 'Preferred working hours is required';
    if (!formData.weeklyAvailability) newErrors.weeklyAvailability = 'Weekly availability is required';
    
    if (!formData.reference) {
      newErrors.reference = 'Reference selection is required';
    }
    
    if (!formData.whyThisRole.trim()) {
      newErrors.whyThisRole = 'Please tell us why you want this role';
    } else if (formData.whyThisRole.trim().length < 20) {
      newErrors.whyThisRole = 'Please provide at least 20 characters explaining why you want this role';
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
      
      // Shake animation for error fields
      Object.keys(errors).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
          field.classList.add('animate-pulse');
          setTimeout(() => field.classList.remove('animate-pulse'), 600);
        }
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
        age: '',
        gender: '',
        education: '',
        city: '',
        currentPosition: '',
        workingHours: '',
        weeklyAvailability: '',
        whyThisRole: '',
        reference: ''
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

  const isFormValid = () => {
    return formData.fullName.trim() &&
           formData.email.trim() &&
           formData.phone.trim() &&
           formData.age.trim() &&
           formData.gender &&
           formData.education &&
           formData.city.trim() &&
           formData.currentPosition &&
           formData.workingHours &&
           formData.weeklyAvailability &&
           formData.reference &&
           formData.whyThisRole.trim().length >= 20;
  };

  if (showSuccess) {
    return (
      <section id="registration-form" className="py-16 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="professional-card p-12 animate-fade-in-up bg-white shadow-xl rounded-2xl">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-montserrat">Application Submitted Successfully!</h2>
              <p className="text-gray-600 text-lg mb-8">
                Thanks for registering! Our team will reach you within 24 hours via WhatsApp.
              </p>
              <button
                onClick={() => setShowSuccess(false)}
                className="premium-secondary-button"
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
    <section id="registration-form" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-6 py-3 bg-orange-50 border border-orange-200 rounded-full mb-6 animate-fade-in-up">
            <span className="text-orange-700 font-semibold font-montserrat">ManaCLG LevelUp • SRM Registration</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 animate-fade-in-up font-montserrat">
            Apply to Become an SRM
          </h1>
          <p className="text-lg text-gray-600 animate-fade-in-up-delay max-w-2xl mx-auto">
            Start your professional journey as a Student Relationship Manager. Fill out the form below to apply.
          </p>
        </div>

        {/* Floating Card Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 animate-fade-in-up-delay">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name */}
                <div className="space-y-3">
                  <label htmlFor="fullName" className="flex items-center text-sm font-bold text-gray-700 font-montserrat">
                    <User className="w-4 h-4 mr-2 text-orange-500" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`premium-input ${
                      errors.fullName ? 'border-red-300 bg-red-50' : ''
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
                <div className="space-y-3">
                  <label htmlFor="email" className="flex items-center text-sm font-bold text-gray-700 font-montserrat">
                    <Mail className="w-4 h-4 mr-2 text-orange-500" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`premium-input ${
                      errors.email ? 'border-red-300 bg-red-50' : ''
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
                <div className="space-y-3">
                  <label htmlFor="phone" className="flex items-center text-sm font-bold text-gray-700 font-montserrat">
                    <Phone className="w-4 h-4 mr-2 text-orange-500" />
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
                    className={`premium-input ${
                      errors.phone ? 'border-red-300 bg-red-50' : ''
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

                {/* Age */}
                <div className="space-y-3">
                  <label htmlFor="age" className="flex items-center text-sm font-bold text-gray-700 font-montserrat">
                    <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                    Age *
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className={`premium-input ${
                      errors.age ? 'border-red-300 bg-red-50' : ''
                    }`}
                    placeholder="Enter your age"
                    min="18"
                    max="65"
                  />
                  {errors.age && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.age}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-3">
                  <label htmlFor="gender" className="flex items-center text-sm font-bold text-gray-700 font-montserrat">
                    <Users className="w-4 h-4 mr-2 text-orange-500" />
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`premium-input ${
                      errors.gender ? 'border-red-300 bg-red-50' : ''
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.gender}
                    </p>
                  )}
                </div>

                {/* Education */}
                <div className="space-y-3">
                  <label htmlFor="education" className="flex items-center text-sm font-bold text-gray-700 font-montserrat">
                    <GraduationCap className="w-4 h-4 mr-2 text-orange-500" />
                    Education Qualification *
                  </label>
                  <select
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className={`premium-input ${
                      errors.education ? 'border-red-300 bg-red-50' : ''
                    }`}
                  >
                    <option value="">Select qualification</option>
                    <option value="10th Pass">10th Pass</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post Graduate">Post Graduate</option>
                  </select>
                  {errors.education && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.education}
                    </p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-3">
                  <label htmlFor="city" className="flex items-center text-sm font-bold text-gray-700 font-montserrat">
                    <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`premium-input ${
                      errors.city ? 'border-red-300 bg-red-50' : ''
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

                {/* Current Position */}
                <div className="space-y-3">
                  <label htmlFor="currentPosition" className="flex items-center text-sm font-bold text-gray-700 font-montserrat">
                    <Briefcase className="w-4 h-4 mr-2 text-orange-500" />
                    Current Position *
                  </label>
                  <select
                    id="currentPosition"
                    name="currentPosition"
                    value={formData.currentPosition}
                    onChange={handleChange}
                    className={`premium-input ${
                      errors.currentPosition ? 'border-red-300 bg-red-50' : ''
                    }`}
                  >
                    <option value="">Select your current position</option>
                    <option value="Employed">Employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Student">Student</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.currentPosition && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.currentPosition}
                    </p>
                  )}
                </div>

                {/* Working Hours */}
                <div className="space-y-3">
                  <label htmlFor="workingHours" className="flex items-center text-sm font-bold text-gray-700 font-montserrat">
                    <Clock className="w-4 h-4 mr-2 text-orange-500" />
                    Preferred Work Hours *
                  </label>
                  <select
                    id="workingHours"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleChange}
                    className={`premium-input ${
                      errors.workingHours ? 'border-red-300 bg-red-50' : ''
                    }`}
                  >
                    <option value="">Select your preferred time</option>
                    <option value="Morning (9 AM - 1 PM)">Morning (9 AM - 1 PM)</option>
                    <option value="Afternoon (1 PM - 5 PM)">Afternoon (1 PM - 5 PM)</option>
                    <option value="Evening (5 PM - 9 PM)">Evening (5 PM - 9 PM)</option>
                  </select>
                  {errors.workingHours && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.workingHours}
                    </p>
                  )}
                </div>

                {/* Weekly Availability */}
                <div className="space-y-3">
                  <label htmlFor="weeklyAvailability" className="flex items-center text-sm font-bold text-gray-700 font-montserrat">
                    <Clock className="w-4 h-4 mr-2 text-orange-500" />
                    Weekly Availability *
                  </label>
                  <select
                    id="weeklyAvailability"
                    name="weeklyAvailability"
                    value={formData.weeklyAvailability}
                    onChange={handleChange}
                    className={`premium-input ${
                      errors.weeklyAvailability ? 'border-red-300 bg-red-50' : ''
                    }`}
                  >
                    <option value="">Select your availability</option>
                    <option value="12 hours/week">12 hours/week</option>
                    <option value="20 hours/week">20 hours/week</option>
                    <option value="30 hours/week">30 hours/week</option>
                  </select>
                  {errors.weeklyAvailability && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.weeklyAvailability}
                    </p>
                  )}
                </div>

                {/* Reference */}
                <div className="space-y-3">
                  <label htmlFor="reference" className="flex items-center text-sm font-bold text-gray-700 font-montserrat">
                    <UserCheck className="w-4 h-4 mr-2 text-orange-500" />
                    Reference *
                  </label>
                  <select
                    id="reference"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    className={`premium-input ${
                      errors.reference ? 'border-red-300 bg-red-50' : ''
                    }`}
                  >
                    <option value="">Select reference</option>
                    {references.map((ref) => (
                      <option key={ref} value={ref}>{ref}</option>
                    ))}
                  </select>
                  {errors.reference && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.reference}
                    </p>
                  )}
                </div>
              </div>

              {/* Why This Role */}
              <div className="space-y-3">
                <label htmlFor="whyThisRole" className="block text-sm font-bold text-gray-700 font-montserrat">
                  Why are you applying for this role? *
                </label>
                <textarea
                  id="whyThisRole"
                  name="whyThisRole"
                  value={formData.whyThisRole}
                  onChange={handleChange}
                  rows={5}
                  className={`premium-input resize-none ${
                    errors.whyThisRole ? 'border-red-300 bg-red-50' : ''
                  }`}
                  placeholder="Tell us why you're interested in this SRM position and what makes you a good fit... (minimum 20 characters)"
                />
                <div className="flex justify-between items-center">
                  {errors.whyThisRole && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.whyThisRole}
                    </p>
                  )}
                  <p className={`text-xs ml-auto font-montserrat ${
                    formData.whyThisRole.length < 20 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {formData.whyThisRole.length}/20 characters minimum
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid()}
                  className="w-full premium-submit-button disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-montserrat"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      SUBMITTING APPLICATION...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      SUBMIT APPLICATION
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
