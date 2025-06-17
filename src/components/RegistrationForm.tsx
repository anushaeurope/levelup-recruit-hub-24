import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from '@/hooks/use-toast';
import { Send, User, Mail, Phone, MapPin, GraduationCap, Users, Clock, Briefcase, Heart, UserCheck } from 'lucide-react';

interface Reference {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
}

const RegistrationForm = () => {
  const [references, setReferences] = useState<Reference[]>([]);
  const [loadingReferences, setLoadingReferences] = useState(true);
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
    reference: '',
    referenceId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReferences();
  }, []);

  const fetchReferences = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'references'));
      const referencesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reference[];
      
      setReferences(referencesData.filter(ref => ref.type === 'reference'));
    } catch (error) {
      console.error('Error fetching references:', error);
      toast({
        title: "Error",
        description: "Failed to load references. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoadingReferences(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If reference is selected, also store the reference ID
    if (name === 'reference' && value) {
      const selectedReference = references.find(ref => ref.name === value);
      setFormData(prev => ({
        ...prev,
        referenceId: selectedReference?.id || ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reference) {
      toast({
        title: "Reference Required",
        description: "Please select a reference to proceed.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedReference = references.find(ref => ref.name === formData.reference);
      
      await addDoc(collection(db, 'applicants'), {
        ...formData,
        referenceId: selectedReference?.id || '',
        referenceName: formData.reference,
        status: 'New',
        salesCompleted: 0,
        submittedAt: Timestamp.now()
      });

      toast({
        title: "Application Submitted! 🎉",
        description: "Thank you for applying! Our team will review your application and get back to you soon.",
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
        reference: '',
        referenceId: ''
      });

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="form" className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Join the ManaCLG LevelUp Team</h2>
            <p className="text-gray-700 text-lg">
              Become a Student Relationship Manager and help students achieve their dreams.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 border border-gray-100">
            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-orange-500" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all duration-300"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all duration-300"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all duration-300"
                    placeholder="Enter your age"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all duration-300"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all duration-300"
                    placeholder="Enter your city"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-orange-500" />
                Professional Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="education" className="block text-sm font-semibold text-gray-700 mb-2">
                    Education Level *
                  </label>
                  <select
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all duration-300"
                  >
                    <option value="">Select Education Level</option>
                    <option value="High School">High School</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="currentPosition" className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Position (Optional)
                  </label>
                  <input
                    type="text"
                    id="currentPosition"
                    name="currentPosition"
                    value={formData.currentPosition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all duration-300"
                    placeholder="e.g., Sales Associate, Student, etc."
                  />
                </div>
              </div>
            </div>

            {/* Availability Information */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-500" />
                Availability Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="workingHours" className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Working Hours *
                  </label>
                  <select
                    id="workingHours"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all duration-300"
                  >
                    <option value="">Select Working Hours</option>
                    <option value="Morning (9 AM - 1 PM)">Morning (9 AM - 1 PM)</option>
                    <option value="Afternoon (1 PM - 6 PM)">Afternoon (1 PM - 6 PM)</option>
                    <option value="Evening (6 PM - 10 PM)">Evening (6 PM - 10 PM)</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="weeklyAvailability" className="block text-sm font-semibold text-gray-700 mb-2">
                    Weekly Availability *
                  </label>
                  <select
                    id="weeklyAvailability"
                    name="weeklyAvailability"
                    value={formData.weeklyAvailability}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all duration-300"
                  >
                    <option value="">Select Weekly Availability</option>
                    <option value="20-30 hours">20-30 hours</option>
                    <option value="30-40 hours">30-40 hours</option>
                    <option value="40+ hours">40+ hours</option>
                    <option value="Part-time weekends">Part-time weekends</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reference Information */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-orange-500" />
                Reference Information
              </h3>
              <div>
                <label htmlFor="reference" className="block text-sm font-semibold text-gray-700 mb-2">
                  How did you hear about this opportunity? *
                </label>
                {loadingReferences ? (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-500 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
                    Loading references...
                  </div>
                ) : (
                  <select
                    id="reference"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all duration-300"
                  >
                    <option value="">Select Reference</option>
                    {references.map((ref) => (
                      <option key={ref.id} value={ref.name}>
                        {ref.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Motivation Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-orange-500" />
                Why This Role?
              </h3>
              <div>
                <label htmlFor="whyThisRole" className="block text-sm font-semibold text-gray-700 mb-2">
                  Why are you interested in becoming a Student Relationship Manager at ManaCLG LevelUp? *
                </label>
                <textarea
                  id="whyThisRole"
                  name="whyThisRole"
                  value={formData.whyThisRole}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all duration-300"
                  placeholder="Explain your motivation and how you can contribute to our team"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all duration-300 font-semibold flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
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
    </section>
  );
};

export default RegistrationForm;
