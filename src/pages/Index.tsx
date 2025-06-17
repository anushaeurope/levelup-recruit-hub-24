
import React from 'react';
import Hero from '../components/Hero';
import RoleOverview from '../components/RoleOverview';
import MotivationalQuotes from '../components/MotivationalQuotes';
import RegistrationForm from '../components/RegistrationForm';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <Hero />
      <RoleOverview />
      <MotivationalQuotes />
      <RegistrationForm />
      <Footer />
    </div>
  );
};

export default Index;
