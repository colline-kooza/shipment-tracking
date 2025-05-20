import { Button } from "@/components/ui/button";
import { UserDropdownMenu } from "@/components/UserDropdownMenu";
import { getAuthUser } from "@/config/useAuth";
import Image from "next/image";
import Link from "next/link";
import React, { ReactNode } from "react";
export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getAuthUser();
  return (
    <div className="bg-white">
      <header className="bg-white shadow-sm">
        <div className="container max-w-6xl mx-auto py-4 px-4 flex items-center justify-between">
          <Link href="/">
            <Image
              width={500}
              height={500}
              src="/green-link.jpeg"
              alt=""
              className="w-32"
            />
          </Link>
          {user ? (
            <Button asChild variant={"ghost"}>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </header>
      {children}
      <footer className="bg-gray-800 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">
                Greenlink Freight Logistics
              </h3>
              <p className="text-gray-300 mb-4">
                Providing reliable logistics and freight services across East
                Africa and beyond.
              </p>
              <p className="text-gray-300">P.O.BOX 116373 Wakiso, Uganda</p>
            </div>

            {/* <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="text-gray-300 hover:text-white">
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="/services"
                    className="text-gray-300 hover:text-white"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="/tracking"
                    className="text-gray-300 hover:text-white"
                  >
                    Track Shipment
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-300 hover:text-white">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div> */}

            <div>
              <h3 className="font-bold text-lg mb-4">Contact Information</h3>
              <ul className="space-y-2">
                <li className="text-gray-300">
                  Email: info@greenlinkfreightlogistics.com
                </li>
                <li className="text-gray-300">Phone: +256 745 331 396</li>
                <li className="text-gray-300">
                  Website: www.greenlinkfreightlogistics.com
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Greenlink Freight Logistics Ltd.
              All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
