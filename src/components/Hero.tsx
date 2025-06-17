
import React from 'react';
import { ArrowDown, Star, Award, Users } from 'lucide-react';

const Hero = () => {
  const scrollToForm = () => {
    document.getElementById('registration-form')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 animate-float-gentle">
          <Star className="text-blue-400 w-6 h-6 opacity-30" />
        </div>
        <div className="absolute top-40 right-20 animate-float-gentle" style={{animationDelay: '2s'}}>
          <Award className="text-orange-400 w-8 h-8 opacity-30" />
        </div>
        <div className="absolute bottom-40 left-20 animate-float-gentle" style={{animationDelay: '4s'}}>
          <Users className="text-blue-500 w-7 h-7 opacity-30" />
        </div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Professional branding */}
          <div className="mb-8 animate-fade-in-up">
            <div className="inline-flex items-center px-6 py-3 bg-blue-50 border border-blue-200 rounded-full mb-6">
              <span className="text-blue-700 font-medium">ManaCLG LevelUp • Education Institution • Recruitment</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-600 mb-2">Student Relationship Manager</h2>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 animate-fade-in-up leading-tight">
            SRM Role – Start Your
            <span className="block gradient-text-primary">Professional Journey</span>
            <span className="block text-3xl md:text-5xl lg:text-6xl text-gray-700">in Education Outreach</span>
          </h1>

          {/* Updated subheading with new copy */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 animate-fade-in-up-delay max-w-4xl mx-auto leading-relaxed">
            Earn a Fixed <span className="text-green-600 font-bold">₹10,000/month</span> + 
            <span className="gradient-text-secondary font-bold"> ₹500 per extra student registration</span>
          </p>

          {/* Hero Image */}
          <div className="mb-12 animate-fade-in-up-delay">
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              <img 
                src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=500&fit=crop&crop=face"
                alt="Professional customer service representative with headset"
                className="relative w-96 h-96 object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500 mx-auto"
              />
            </div>
          </div>

          {/* Updated premium CTA Button */}
          <button
            onClick={scrollToForm}
            className="group relative premium-cta-button text-xl animate-fade-in-up-delay"
          >
            <span className="mr-3">APPLY NOW</span>
            <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
          </button>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ArrowDown className="text-gray-400 w-6 h-6" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
