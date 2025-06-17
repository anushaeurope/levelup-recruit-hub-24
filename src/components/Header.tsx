
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleAgentLogin = () => {
    navigate('/agent');
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home', id: 'top' },
    { label: 'About', id: 'about-us' },
    { label: 'Apply Now', id: 'registration-form' },
    { label: 'Contact', id: 'footer' }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center h-18 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <button onClick={() => scrollToSection('top')}>
              <img 
                src="https://res.cloudinary.com/dvmrhs2ek/image/upload/v1750141579/qkehxe09cunkcvyh8o1i.jpg"
                alt="ManaCLG LevelUp Logo"
                className="h-12 w-auto object-contain"
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-gray-900 font-semibold tracking-wide hover:text-orange-500 transition-colors duration-300 text-sm font-montserrat"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={handleAgentLogin}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 font-montserrat text-sm"
            >
              Agent Login
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="pt-20 px-6">
              <nav className="space-y-4">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="block w-full text-left text-gray-900 font-semibold text-lg tracking-wide hover:text-orange-500 transition-colors duration-300 py-4 border-b border-gray-100 font-montserrat"
                  >
                    {link.label}
                  </button>
                ))}
                <button
                  onClick={handleAgentLogin}
                  className="block w-full text-left bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 mt-6 font-montserrat"
                >
                  Agent Login
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
