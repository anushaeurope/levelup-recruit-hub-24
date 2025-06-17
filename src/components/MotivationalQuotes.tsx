
import React from 'react';
import { Quote } from 'lucide-react';

const MotivationalQuotes = () => {
  const quotes = [
    {
      text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
      author: "Winston Churchill"
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt"
    },
    {
      text: "Your career is your business. It is your responsibility to manage it.",
      author: "Barbara Corcoran"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-blue-50 via-white to-orange-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16 animate-fade-in-up">
            Words of Inspiration
          </h2>
          
          <div className="space-y-12">
            {quotes.map((quote, index) => (
              <div
                key={index}
                className="professional-card p-8 md:p-12 animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-start justify-center mb-6">
                  <Quote className="w-8 h-8 text-blue-500 mr-4 mt-1 flex-shrink-0" />
                  <blockquote className="text-xl md:text-2xl font-light text-gray-700 italic leading-relaxed">
                    "{quote.text}"
                  </blockquote>
                </div>
                <p className="text-lg font-semibold gradient-text-primary">
                  — {quote.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MotivationalQuotes;
