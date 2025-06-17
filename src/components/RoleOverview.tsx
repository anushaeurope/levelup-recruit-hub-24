
import React from 'react';
import { DollarSign, Clock, Target, TrendingUp, Award, BookOpen } from 'lucide-react';

const RoleOverview = () => {
  const features = [
    {
      icon: DollarSign,
      title: "Fixed Salary",
      value: "₹10,000/month",
      description: "Paid monthly via UPI or bank transfer",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: Clock,
      title: "Flexible Hours",
      value: "4 hrs/day minimum",
      description: "12 hrs/week commitment required",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: Target,
      title: "Weekly Target",
      value: "1 confirmed registration",
      description: "Only confirmed student enrollments count",
      gradient: "from-purple-500 to-violet-600"
    },
    {
      icon: TrendingUp,
      title: "Bonus Earnings",
      value: "₹500/sale",
      description: "After 4th registration in a month",
      gradient: "from-orange-500 to-red-600"
    },
    {
      icon: Award,
      title: "Professional Perks",
      value: "LOR + Payslip + Certificate",
      description: "Experience Certificate issued after 4 weeks + minimum 4 sales",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: BookOpen,
      title: "Daily Training",
      value: "1-hour guided sessions",
      description: "Comprehensive skill development included",
      gradient: "from-indigo-500 to-blue-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
            What You'll Get
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto animate-fade-in-delay">
            Join our premium SRM program and unlock a world of opportunities with competitive compensation and professional growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:bg-gray-800/70 transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Icon */}
              <div className={`relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text mb-3">
                  {feature.value}
                </p>
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>

              {/* Hover effect border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/30 rounded-2xl transition-colors duration-500"></div>
            </div>
          ))}
        </div>

        {/* Call to action section */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border border-yellow-500/20 rounded-full">
            <span className="text-yellow-300 font-medium">⚠️ Limited positions available - First come, first serve</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoleOverview;
