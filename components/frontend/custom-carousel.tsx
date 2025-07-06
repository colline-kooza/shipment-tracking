"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Mail, Phone } from "lucide-react";
import Logo from "../global/Logo";

const carouselItems = [
  // {
  //   image:
  //     "https://images.unsplash.com/photo-1586366775916-7c6d355b7f9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  //   title: "Global Cargo Solutions",
  //   subtitle:
  //     "Connecting Businesses Across Continents with Green Link Logistics",
  // },
  // {
  //   image:
  //     "https://images.unsplash.com/photo-1563299796-17596ed6b017?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  //   title: "Eco-Friendly Transportation",
  //   subtitle: "Sustainable Shipping Options to Reduce Your Carbon Footprint",
  // },
  {
    image:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    title: "Premium Fleet Services",
    subtitle: "Modern Vehicles Ensuring Safe and Timely Deliveries",
  },
  // {
  //   image:
  //     "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  //   title: "24/7 Shipment Tracking",
  //   subtitle: "Real-Time Updates and Complete Visibility of Your Cargo",
  // },
  // {
  //   image:
  //     "https://images.unsplash.com/photo-1577018641547-95062622c430?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  //   title: "International Logistics Expertise",
  //   subtitle: "Seamless Cross-Border Transportation and Customs Management",
  // },
];

export default function CustomCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + carouselItems.length) % carouselItems.length
    );
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      <div className="absolute inset-0">
        {carouselItems.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={item.image}
              alt={`Slide ${index + 1}`}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/70 to-blue-900/70" />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col items-center justify-end p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">
          {carouselItems[currentSlide].title}
        </h2>
        <p className="text-xl mb-8">{carouselItems[currentSlide].subtitle}</p>

        {/* Contact details added here */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center mb-2">
            <Mail className="w-4 h-4 mr-2" />
            <span>info@greenlinkfreightlogistics.com</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            <span>+256 745 331 396</span>
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? "bg-red-400 w-8" : "bg-white/50"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
      {/* <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/75 hover:text-red-400 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/75 hover:text-blue-400 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-8 h-8" />
      </button> */}
    </div>
  );
}
