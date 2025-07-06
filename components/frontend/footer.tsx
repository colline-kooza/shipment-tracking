"use client";
import Image from "next/image";
import Link from "next/link";
import ThemeButton from "./theme-button";
import { useRouter } from "next/navigation";
import { getContactInfo } from "@/config/meta";
import Logo from "../global/Logo";

export default function Footer() {
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "API Docs", href: "/api-docs" },
    { label: "Help Center", href: "/help-center" },
    { label: "Contact", href: "/contact" },
  ];

  const serviceItems = [
    { label: "SMS Messaging", href: "/features/sms-messaging" },
    { label: "Email Campaigns", href: "/features/email-campaigns" },
    { label: "Contact Management", href: "/features/contact-management" },
    { label: "Message Templates", href: "/features/message-templates" },
    { label: "Bulk Messaging", href: "/features/bulk-messaging" },
  ];

  const resourceItems = [
    { label: "Getting Started Guide", href: "/resources/getting-started" },
    { label: "API Documentation", href: "/api-docs" },
    { label: "SMS Best Practices", href: "/resources/sms-best-practices" },
    { label: "Email Marketing Tips", href: "/resources/email-marketing" },
  ];

  const router = useRouter();
  const { email, fullAddress, mainPhone } = getContactInfo();

  return (
    <footer className="bg-gray-900 text-white py-16 px-4 md:px-8 lg:px-16 rounded-t-[2.5rem] relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative">
        {/* Top Section */}
        <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-8 md:mb-0">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Communicate smarter with Wesendall
            </h2>
            <p className="text-gray-400 max-w-xl text-base">
              Reach your audience effectively with our powerful SMS and email
              messaging platform. Connect with customers, colleagues, and
              communities all from one intuitive dashboard.
            </p>
          </div>
          <div className="flex gap-4 md:flex-row flex-col">
            <button
              onClick={() => router.push("/contact")}
              className="px-6 md:!py-1 py-3 border border-gray-700 hover:border-blue-500 rounded-full text-gray-300 hover:text-blue-400 transition-all duration-300 block"
            >
              Contact Us
            </button>
            <ThemeButton href="/register" title="Get Started" />
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
            {/* Logo and Social Media Section */}
            <div className="lg:col-span-3">
              <Logo darkMode href="/" />
              <div className="flex flex-col mt-6">
                <h3 className="text-base font-semibold mb-4 text-gray-200">
                  Connect With Us
                </h3>
                <div className="flex gap-4">
                  {[
                    {
                      icon: "https://cdn-icons-png.flaticon.com/128/3670/3670151.png",
                      href: "https://twitter.com",
                    },
                    {
                      icon: "https://cdn-icons-png.flaticon.com/128/145/145807.png",
                      href: "https://linkedin.com",
                    },
                    {
                      icon: "https://cdn-icons-png.flaticon.com/128/3955/3955024.png",
                      href: "https://instagram.com",
                    },
                    {
                      icon: "https://cdn-icons-png.flaticon.com/128/5968/5968764.png",
                      href: "https://facebook.com",
                    },
                  ].map((social, index) => (
                    <Link
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full hover:bg-blue-500/20 transition-all duration-300"
                    >
                      <Image
                        src={social.icon}
                        alt="Social media icon"
                        width={20}
                        height={20}
                        className="opacity-75 hover:opacity-100 transition-opacity"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h3 className="text-base font-semibold mb-4 text-gray-200">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {navItems.map((item, i) => (
                  <li key={i}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-2"
                    >
                      <span className="w-1 h-1 bg-blue-500 rounded-full opacity-0 transition-opacity group-hover:opacity-100"></span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="lg:col-span-2">
              <h3 className="text-base font-semibold mb-4 text-gray-200">
                Our Services
              </h3>
              <ul className="space-y-3">
                {serviceItems.map((service, i) => (
                  <li key={i}>
                    <Link
                      href={service.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-2"
                    >
                      <span className="w-1 h-1 bg-blue-500 rounded-full opacity-0 transition-opacity group-hover:opacity-100"></span>
                      {service.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="lg:col-span-2">
              <h3 className="text-base font-semibold mb-4 text-gray-200">
                Resources
              </h3>
              <ul className="space-y-3">
                {resourceItems.map((resource, i) => (
                  <li key={i}>
                    <Link
                      href={resource.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center gap-2"
                    >
                      <span className="w-1 h-1 bg-blue-500 rounded-full opacity-0 transition-opacity group-hover:opacity-100"></span>
                      {resource.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Information */}
            <div className="lg:col-span-3">
              <h3 className="text-base font-semibold mb-4 text-gray-200">
                Contact Information
              </h3>
              <ul className="space-y-4">
                <li className="text-gray-400 text-sm flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center mt-0.5">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  </span>
                  Phone: {mainPhone || "+1 (234) 567-8900"}
                </li>
                <li className="text-gray-400 text-sm flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center mt-0.5">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  </span>
                  Email: {email || "support@wesenditall.com"}
                </li>
                <li className="text-gray-400 text-sm flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center mt-0.5">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  </span>
                  Address:
                  <br />
                  {fullAddress ||
                    "123 Messaging Street, Suite 456, Communication City, CM 12345"}
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()}{" "}
              <Link href="/" className="hover:text-blue-400 transition-colors">
                Wesendall
              </Link>{" "}
              |
              <Link
                href="/privacy-policy"
                className="hover:text-blue-400 transition-colors ml-2"
              >
                Privacy Policy
              </Link>{" "}
              |
              <Link
                href="/terms"
                className="hover:text-blue-400 transition-colors ml-2"
              >
                Terms & Conditions
              </Link>{" "}
              |
              <Link
                href="/accessibility"
                className="hover:text-blue-400 transition-colors ml-2"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
