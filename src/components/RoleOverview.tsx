
import React from 'react';
import { DollarSign, Clock, Target, TrendingUp, Award, BookOpen, Home, CheckCircle } from 'lucide-react';

const RoleOverview = () => {
  const features = [
    {
      icon: DollarSign,
      title: "Monthly Salary",
      value: "₹10,000",
      description: "Fixed monthly payment via UPI or bank transfer",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Clock,
      title: "Daily Work",
      value: "4 hours/day",
      description: "OR 12+ hours/week minimum commitment",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Target,
      title: "Minimum Target",
      value: "1 registration/week",
      description: "Only confirmed student enrollments count",
      color: "from-purple-500 to-violet-600"
    },
    {
      icon: TrendingUp,
      title: "Incentives",
      value: "₹500–₹1000",
      description: "Per confirmed registration after 4/month",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: Award,
      title: "Benefits",
      value: "LOR + Certificate",
      description: "Experience Certificate, Monthly Payslip",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: BookOpen,
      title: "Free Training",
      value: "1 hour daily",
      description: "Guided training before work begins",
      color: "from-indigo-500 to-blue-600"
    },
    {
      icon: Home,
      title: "Work From Home",
      value: "100% Remote",
      description: "Work from anywhere with internet",
      color: "from-teal-500 to-cyan-600"
    },
    {
      icon: CheckCircle,
      title: "Professional Growth",
      value: "Career Development",
      description: "Build communication & sales skills",
      color: "from-emerald-500 to-green-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 animate-fade-in-up">
            SRM Role Details
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up-delay">
            Everything you need to know about becoming a Student Relationship Manager at ManaCLG LevelUp
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="professional-card p-6 hover:shadow-xl transition-all duration-500 hover:scale-105 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl mb-4 shadow-lg`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-xl font-black gradient-text-primary mb-3">
                {feature.value}
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleOverview;
