import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Restaurant Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Tønsberg Pizza
            </h3>
            <p className="mb-4"></p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6 hover:text-blue-500 transition-colors" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6 hover:text-pink-500 transition-colors" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6 hover:text-blue-400 transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Sider</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Hjem
                </Link>
              </li>
              <li>
                <Link
                  href="/menu"
                  className="hover:text-white transition-colors"
                >
                  Meny
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Services */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Kundeservice
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/login"
                  className="hover:text-white transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="register"
                  className="hover:text-white transition-colors"
                >
                  Registrer
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="hover:text-white transition-colors"
                >
                  Ordrehistorie
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Kontakt oss
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <span>123 Gourmet Street, Foodville, FK 12345</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                <a
                  href="tel:+11234567890"
                  className="hover:text-white transition-colors"
                >
                  +1 (123) 456-7890
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                <a
                  href="mailto:info@gourmetdelights.com"
                  className="hover:text-white transition-colors"
                >
                  info@gourmetdelights.com
                </a>
              </li>
              <li className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>Mon-Sat: 11AM - 10PM, Sun: 12PM - 9PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-12 border-t border-gray-800 pt-8">
          <h3 className="text-white text-lg font-semibold mb-4">
            Subscribe to Our Newsletter
          </h3>
          <form className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-grow px-4 py-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Copyright and Additional Links */}
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {currentYear} Gourmet Delights. All rights reserved.</p>
          <nav className="mt-4 md:mt-0">
            <ul className="flex space-x-4">
              <li>
                <Link
                  href="/sitemap"
                  className="hover:text-white transition-colors"
                >
                  Sitemap
                </Link>
              </li>
              <li>
                <Link
                  href="/accessibility"
                  className="hover:text-white transition-colors"
                >
                  Accessibility
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-policy"
                  className="hover:text-white transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
