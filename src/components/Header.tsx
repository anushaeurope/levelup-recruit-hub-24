
import React from 'react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex justify-center lg:justify-start">
        <img 
          src="https://res.cloudinary.com/dvmrhs2ek/image/upload/v1750141579/qkehxe09cunkcvyh8o1i.jpg"
          alt="ManaCLG LevelUp Logo"
          className="h-12 w-auto object-contain"
        />
      </div>
    </header>
  );
};

export default Header;
