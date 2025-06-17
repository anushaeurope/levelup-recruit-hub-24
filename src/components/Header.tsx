
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navLinks = [
    { label: 'Home', id: 'top' },
    { label: 'About Us', id: 'about-us' },
    { label: 'Apply Now', id: 'registration-form' }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-black shadow-lg transition-all duration-300">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="https://res.cloudinary.com/dvmrhs2ek/image/upload/v1750141579/qkehxe09cunkcvyh8o1i.jpg"
              alt="ManaCLG LevelUp Logo"
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-white font-montserrat font-medium tracking-wide relative group transition-all duration-300 hover:text-orange-400"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-black shadow-xl transform transition-transform duration-300 ease-in-out animate-slide-in-right">
            <div className="pt-20 px-6">
              <nav className="space-y-6">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="block w-full text-left text-white font-montserrat font-medium text-lg tracking-wide hover:text-orange-400 transition-colors duration-300 py-4 border-b border-gray-800"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
