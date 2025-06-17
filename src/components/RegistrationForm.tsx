import React, { useState, useEffect } from 'react';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from "@/components/ui/use-toast"

interface FormData {
  name: string;
  email: string;
  phone: string;
  city: string;
  reference: string;
}

const RegistrationForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    city: '',
    reference: ''
  });
  const [loading, setLoading] = useState(false);
  const [references, setReferences] = useState<any[]>([]);

  useEffect(() => {
    fetchReferences();
  }, []);

  const fetchReferences = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'references'));
      const refs: any[] = [];
      querySnapshot.forEach((doc) => {
        refs.push({ id: doc.id, ...doc.data() });
      });
      setReferences(refs);
    } catch (error) {
      console.error('Error fetching references:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reference) {
      toast({
        title: "Error",
        description: "Please select a reference",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Find the selected reference to get its ID
      const selectedRef = references.find(ref => ref.name === formData.reference);
      
      const docRef = await addDoc(collection(db, 'applications'), {
        ...formData,
        referenceId: selectedRef?.id || '',
        referenceName: formData.reference,
        status: 'New',
        submittedAt: new Date(),
        createdAt: new Date()
      });

      console.log('Document written with ID: ', docRef.id);
      
      toast({
        title: "Success!",
        description: "Your application has been submitted successfully. We'll contact you soon!",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        city: '',
        reference: ''
      });
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        title: "Error",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <section id="registration-form" className="py-20 bg-white">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 font-montserrat mb-4">
          Apply Now
        </h2>
        <p className="text-gray-600 text-sm lg:text-base">
          Join ManaCLG LevelUp and start your journey to a successful remote career!
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="Enter your email address"
              required
            />
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="Enter your phone number"
              required
            />
          </div>

          {/* City Field */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="Enter your city"
              required
            />
          </div>

          {/* Reference Field */}
          <div>
            <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
              Reference / How did you hear about us? *
            </label>
            <select
              id="reference"
              name="reference"
              value={formData.reference}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200"
              required
            >
              <option value="">Select a reference</option>
              {references.map((ref) => (
                <option key={ref.id} value={ref.name}>
                  {ref.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default RegistrationForm;
