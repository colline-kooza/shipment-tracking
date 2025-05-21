import { Button } from "@/components/ui/button"
import { UserDropdownMenu } from "@/components/UserDropdownMenu"
import { getAuthUser } from "@/config/useAuth"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import { Package, MapPin, Phone, Mail, Globe } from "lucide-react"

export default async function HomeLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await getAuthUser()

  return (
    <div className="min-h-screen relative bg-gray-50">
      {/* Blurry background image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Background"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-[#0f2557]/80 backdrop-blur-md"></div>
      </div>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/10 shadow-lg">
        <div className="container max-w-6xl mx-auto py-3 px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#0f2557] flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="font-bold text-xl text-white">TRAKIT</span>
          </Link>

          <div className="flex items-center space-x-4">
          
            {user ? (
              <UserDropdownMenu {...user} />
            ) : (
              <Button asChild className="bg-white text-[#0f2557] hover:bg-white/90 transition-colors">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-16">{children}</main>

      {/* Footer */}
      <footer className="relative z-10 bg-[#0f2557]/95 backdrop-blur-md text-white mt-20 border-t border-white/10">
        <div className="container mx-auto px-4 py-12">
          {/* Top section with logo and info */}
          <div className="flex flex-col md:flex-row justify-between mb-12">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white flex items-center justify-center">
                  <span className="text-[#0f2557] font-bold text-xl">T</span>
                </div>
                <span className="font-bold text-xl text-white">TRAKIT</span>
              </div>
              <p className="text-gray-300 max-w-md">
                Your trusted partner for reliable logistics and freight services across East Africa and beyond.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
              <div>
                <h3 className="font-bold text-base mb-4 text-[#4d82e5]">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/about" className="text-gray-300 hover:text-white transition-colors flex items-center">
                      <span>About Us</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services"
                      className="text-gray-300 hover:text-white transition-colors flex items-center"
                    >
                      <span>Our Services</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/team" className="text-gray-300 hover:text-white transition-colors flex items-center">
                      <span>Our Team</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4 text-[#4d82e5]">Services</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/services/freight"
                      className="text-gray-300 hover:text-white transition-colors flex items-center"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      <span>Freight Forwarding</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services/tracking"
                      className="text-gray-300 hover:text-white transition-colors flex items-center"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>Cargo Tracking</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/services/warehousing"
                      className="text-gray-300 hover:text-white transition-colors flex items-center"
                    >
                      <span>Warehousing</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4 text-[#4d82e5]">Contact</h3>
                <ul className="space-y-3">
                  <li className="text-gray-300 flex items-start">
                    <Mail className="h-5 w-5 mr-2 mt-0.5 text-[#4d82e5]" />
                    <span>info@trakitlogistics.com</span>
                  </li>
                  <li className="text-gray-300 flex items-start">
                    <Phone className="h-5 w-5 mr-2 mt-0.5 text-[#4d82e5]" />
                    <span>+256 745 331 396</span>
                  </li>
                  <li className="text-gray-300 flex items-start">
                    <Globe className="h-5 w-5 mr-2 mt-0.5 text-[#4d82e5]" />
                    <span>www.trakitlogistics.com</span>
                  </li>
                  <li className="text-gray-300">
                    <span>P.O.BOX 116373 Wakiso, Uganda</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom section with copyright */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} TRAKIT Logistics Ltd. All rights reserved.
              </p>

              <div className="flex space-x-6">
                <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
                <Link href="/sitemap" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Sitemap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
