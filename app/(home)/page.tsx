import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Package, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Track Your Shipment | Greenlink Freight Logistics",
  description:
    "Track your shipment in real-time with Greenlink Freight Logistics. Enter your tracking number to get the latest status updates.",
};

export default function TrackingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <section className="relative bg-gradient-to-br from-emerald-600 to-green-800 overflow-hidden">
          {/* Abstract geometric shapes for unique background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white"></div>
            <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-white"></div>
            <div className="absolute top-40 right-40 w-32 h-32 rounded-full bg-white"></div>
          </div>
          
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 mb-10 md:mb-0 text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Track Your Shipment
                  <span className="block text-green-300">In Real-Time</span>
                </h1>
                <p className="text-lg md:text-xl mb-8 text-gray-100 max-w-lg">
                  Follow your package's journey from origin to destination with our 
                  advanced tracking system providing up-to-the-minute status updates.
                </p>
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center px-8 py-3 bg-white text-emerald-700 hover:bg-green-100 rounded-lg font-semibold transition duration-300 transform hover:translate-x-1"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
              
              <div className="w-full md:w-1/2 flex justify-center">
                <div className="relative w-full max-w-md">
                  {/* Tracking illustration */}
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <Package className="h-8 w-8 text-emerald-600 mr-3" />
                        <span className="text-xl font-semibold text-gray-800">Trakit</span>
                      </div>
                      <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        In Transit
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="mt-1 mr-4">
                          <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center">
                            <MapPin className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Origin</p>
                          <p className="font-medium text-gray-800">San Francisco, CA</p>
                        </div>
                      </div>
                      
                      <div className="pl-8">
                        <div className="border-l-2 border-dashed border-emerald-400 h-12"></div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 mr-4">
                          <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                            <Clock className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Current Location</p>
                          <p className="font-medium text-gray-800">Chicago, IL</p>
                          <p className="text-sm text-gray-500 mt-1">Estimated delivery in 2 days</p>
                        </div>
                      </div>
                      
                      <div className="pl-8">
                        <div className="border-l-2 border-dashed border-gray-300 h-12"></div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-1 mr-4">
                          <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                            <MapPin className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Destination</p>
                          <p className="font-medium text-gray-800">New York, NY</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}