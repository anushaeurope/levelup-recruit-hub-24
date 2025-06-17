
import React from 'react';
import Hero from '../components/Hero';
import RoleOverview from '../components/RoleOverview';
import RegistrationForm from '../components/RegistrationForm';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900 font-montserrat">
      <Hero />
      <RoleOverview />
      <RegistrationForm />
      <Footer />
    </div>
  );
};

export default Index;
