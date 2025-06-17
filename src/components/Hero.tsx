
import React from 'react';
import { ArrowDown, Headphones, Star, TrendingUp } from 'lucide-react';

const Hero = () => {
  const scrollToForm = () => {
    document.getElementById('registration-form')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 animate-float-slow">
          <Star className="text-yellow-400 w-6 h-6 opacity-20" />
        </div>
        <div className="absolute top-40 right-20 animate-float-medium">
          <TrendingUp className="text-blue-400 w-8 h-8 opacity-20" />
        </div>
        <div className="absolute bottom-40 left-20 animate-float-fast">
          <Headphones className="text-green-400 w-7 h-7 opacity-20" />
        </div>
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Animated badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/20 rounded-full mb-8 animate-fade-in">
            <span className="text-sm text-blue-300 font-medium">🚀 Limited Positions Available</span>
          </div>

          {/* Main heading with gradient text */}
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-6 animate-slide-up leading-tight">
            Join as a Student Relationship Manager
            <span className="block text-4xl md:text-6xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">(SRM)</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 animate-slide-up-delay max-w-3xl mx-auto leading-relaxed">
            Earn <span className="text-green-400 font-semibold">₹10,000/month</span> + 
            <span className="text-yellow-400 font-semibold"> ₹500 for every extra confirmed sale</span>
          </p>

          {/* Hero Image */}
          <div className="mb-12 animate-fade-in-delay">
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              <img 
                src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=500&h=400&fit=crop&crop=face"
                alt="Smiling sales professional with headset"
                className="relative w-80 h-80 object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500 mx-auto"
              />
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={scrollToForm}
            className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse-slow"
          >
            <span className="mr-2">Register Now</span>
            <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
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
