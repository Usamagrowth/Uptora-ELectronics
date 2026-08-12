import Link from "next/link";
import { Headphones, Mail, MapPin, Phone, ShieldCheck, Truck, Zap } from "lucide-react";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  const year = new Date().getFullYear();

  const linkClass =
    "text-sm text-gray-600 transition-colors hover:text-brand-600";

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-bold text-gray-900">Uptora Electronics</span>
            </div>
            <p className="text-sm leading-6 text-gray-600 mb-4">
              A Nigerian electronics retailer for phones, appliances, audio, computing and power essentials. Shop
              genuine products with secure checkout and reachable support.
            </p>
            <Link href="/about" className="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700">
              Learn more about us →
            </Link>
          </div>

          {/* Shop Section */}
          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-brand-600">
              Shop
            </h3>
            <ul className="space-y-3">
              <li><Link href="/" className={linkClass}>All products</Link></li>
              <li><Link href="/?category=Inverter%20%26%20Battery" className={linkClass}>Inverter & Battery</Link></li>
              <li><Link href="/?category=Phones%20%26%20Tablets" className={linkClass}>Phones & Tablets</Link></li>
              <li><Link href="/?category=Appliances" className={linkClass}>Appliances</Link></li>
              <li><Link href="/checkout" className={linkClass}>Checkout</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="mb-4 text-xs uppercase tracking-[0.16em] text-brand-600">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-brand-600 shrink-0" />
                <span className="text-sm text-gray-600">uptoraelectronics@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-brand-600 shrink-0" />
                <span className="text-sm text-gray-600">+234 9024988998</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-brand-600 shrink-0" />
                <span className="text-sm text-gray-600">Nigeria</span>
              </li>
            </ul>
            <ul className="flex gap-5 pt-6 "> 
           <a href="https://facebook.com/uptoraelectronics" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className=" text-gray-600 hover:text-brand-400">
              <FaFacebook className="h-4 w-4" />
               </a>
              <a href="https://instagram.com/uptoraelectronics" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className=" text-gray-600 hover:text-brand-400">
              <FaInstagram className="h-4 w-4" />
               </a>
              <a href="https://x.com/uptoraelectroni" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className=" text-gray-600  hover:text-brand-400">
              <FaXTwitter className="h-4 w-4" />
              </a>
               <a href="https://tiktok.com/@uptoraelectronics" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className=" text-gray-600 hover:text-brand-400">
              <FaTiktok className="h-4 w-4 " />
              </a>
            </ul>
          </div>

          {/* Trust Section */}
          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-brand-600">
              Why Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-brand-600 shrink-0" />
                <span className="text-sm text-gray-600">Genuine Products</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="mt-0.5 h-4 w-4 text-brand-600 shrink-0" />
                <span className="text-sm text-gray-600">Fast Delivery</span>
              </li>
              <li className="flex items-start gap-2">
                <Headphones className="mt-0.5 h-4 w-4 text-brand-600 shrink-0" />
                <span className="text-sm text-gray-600">24/7 Support</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-gray-200 pt-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Uptora Electronics. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-brand-600 transition">About</Link>
            <Link href="/privacy#privacy-policy" className="hover:text-brand-600 transition">Privacy</Link>
            <Link href="/terms#terms-of-service" className="hover:text-brand-600 transition">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
