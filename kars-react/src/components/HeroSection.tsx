import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  onSearch?: (query: { vehicleType: string; searchTerm: string }) => void;
}

const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const heroImages = [
    '/media/hero1.jpg',
    '/media/hero2.jpeg', 
    '/media/hero3.jpeg',
    '/media/hero4.jpg',
    '/media/hero5.jpg',
    '/media/hero6.jpg',
    '/media/hero7.jpg'
  ];

  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="relative h-[600px] rounded-lg overflow-hidden mb-4">
        {/* Image Slider */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Hero slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Slider Lines */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1 transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75 w-4'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Ver Todos Los Vehículos Button - Below slider */}
      <div className="text-center">
        <button
          onClick={() => navigate('/vehicles')}
          className="bg-primary text-white px-8 py-4 text-lg font-bold rounded-lg border-2 border-transparent hover:border-white hover:bg-black transition-all duration-300"
        >
          VEURE TOTS ELS VEHICLES
        </button>
      </div>
    </section>
  );
};

export default HeroSection; 