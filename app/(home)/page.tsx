import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Package, MapPin, Clock, Truck } from "lucide-react"

export const metadata: Metadata = {
  title: "Track Your Shipment | TRAKIT Logistics",
  description:
    "Track your shipment in real-time with TRAKIT Logistics. Enter your tracking number to get the latest status updates.",
}

export default function TrackingPage() {
  return (
    <div className="min-h-screen relative">
      {/* Blurry background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://img.freepik.com/free-photo/aerial-view-cargo-ship-cargo-container-harbor_335224-1380.jpg?ga=GA1.1.1036439435.1744115746&semt=ais_hybrid&w=740"
          alt="Background"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-[#0f2557]/80 backdrop-blur-sm"></div>
      </div>

      <main className="relative z-10 mx-auto">
        <section className="relative overflow-hidden">
          {/* Abstract geometric shapes for unique background */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/5 backdrop-blur-xl"></div>
            <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-white/5 backdrop-blur-xl"></div>
            <div className="absolute top-40 right-40 w-32 h-32 rounded-full bg-white/5 backdrop-blur-xl"></div>
          </div>

          <div className="container mx-auto px-4 py-16 md:py-14 relative z-10">
            <div className="flex flex-col md:flex-row ">
              <div className="w-full md:w-1/2  md:mb-0 text-white md:ml-12  md:mt-10">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md mb-6">
                  <Truck className="h-4 w-4 text-[#4d82e5] mr-2" />
                  <span className="text-xs font-medium text-white">Real-time Tracking</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  Track Your Shipment
                  <span className="block text-[#4d82e5]">In Real-Time</span>
                </h1>
                <p className="text-lg md:text-lg mb-8 text-gray-100 max-w-lg">
                  Follow your package's journey from origin to destination with our advanced tracking system providing
                  up-to-the-minute status updates.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-3 bg-white text-[#0f2557] hover:bg-[#4d82e5]/10 hover:text-white hover:border-white border border-transparent rounded-lg font-semibold transition duration-300 transform hover:translate-x-1 text-sm"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>

              <div className="w-full md:w-1/2 flex justify-center">
                <div className="relative w-full max-w-md">
                  {/* Tracking card with glass morphism effect */}
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 shadow-2xl border border-white/20 text-white">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-[#0f2557] flex items-center justify-center mr-3">
                          <span className="font-bold text-white">T</span>
                        </div>
                        <span className="text-xl font-semibold">TRAKIT</span>
                      </div>
                      <div className="px-3 py-1 bg-[#4d82e5]/20 border border-[#4d82e5]/30 text-[#4d82e5] rounded-full text-sm font-medium">
                        In Transit
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="mt-1 mr-4">
                          <div className="h-8 w-8 rounded-full bg-[#4d82e5] flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-300">Origin</p>
                          <p className="font-medium text-white">Kampala, Uganda</p>
                          <p className="text-xs text-gray-400 mt-1">Departed on May 18, 2025</p>
                        </div>
                      </div>

                      <div className="pl-8">
                        <div className="border-l-2 border-dashed border-[#4d82e5] h-12"></div>
                      </div>

                      <div className="flex items-start">
                        <div className="mt-1 mr-4">
                          <div className="h-8 w-8 rounded-full bg-[#4d82e5] flex items-center justify-center animate-pulse">
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-300">Current Location</p>
                          <p className="font-medium text-white">Nairobi, Kenya</p>
                          <p className="text-xs text-gray-400 mt-1">Arrived on May 20, 2025 • 10:45 AM</p>
                          <div className="mt-2 px-3 py-1.5 bg-[#4d82e5]/10 border border-[#4d82e5]/20 rounded-lg">
                            <p className="text-sm text-[#4d82e5]">Estimated delivery in 2 days</p>
                          </div>
                        </div>
                      </div>

                      <div className="pl-8">
                        <div className="border-l-2 border-dashed border-gray-500/30 h-12"></div>
                      </div>

                      <div className="flex items-start">
                        <div className="mt-1 mr-4">
                          <div className="h-8 w-8 rounded-full bg-gray-500/30 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-white/70" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-300">Destination</p>
                          <p className="font-medium text-white">Dar es Salaam, Tanzania</p>
                          <p className="text-xs text-gray-400 mt-1">Expected on May 22, 2025</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-300">Tracking Number</p>
                          <p className="font-mono font-medium text-white">TRK-2025051923</p>
                        </div>
                        <Link
                          href="#"
                          className="text-[#4d82e5] hover:text-white text-sm font-medium flex items-center"
                        >
                          View Details
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-[#4d82e5]/20 backdrop-blur-xl -z-10"></div>
                  <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-[#4d82e5]/20 backdrop-blur-xl -z-10"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

       
      </main>
    </div>
  )
}
