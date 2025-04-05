'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';

const navItems = [
  { label: 'Search', href: '/interviewsearch' },
  { label: "Add", href: '/addinterview' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Add font import in the head */}
      <div className="bg-white">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <nav className="bg-white border-b shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* Left side: Image (linked to homepage) */}
          <div className="w-1/3 flex items-center">
            <Link href="/">
              <Image
                src="/ThetaTau.png" // Ensure this path matches your file location
                alt="Theta Tau Logo"
                width={50} // Adjust the width as needed
                height={75} // Adjust the height as needed
                className="object-contain"
                priority={true} // Optional: Prioritize loading if above the fold
              />
            </Link>
          </div>

          {/* Centered title (now also linked to homepage) */}
          <div className="w-1/3 flex justify-center">
            <Link href="/">
              <h1
                className="text-xl font-semibold text-center"
                style={{ fontFamily: 'League Spartan, sans-serif', color: '#8b0000' }}
              >
                THETA TAU GLASSDOOR
              </h1>
            </Link>
          </div>

          {/* Right-aligned nav items */}
          <div className="w-1/3 flex justify-end space-x-4">
            {navItems.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium ${
                  pathname === href
                    ? 'underline'
                    : 'hover:text-red-700'
                }`}
                style={{ fontFamily: 'League Spartan, sans-serif', color: '#8b0000' }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      </div>
    </>
  );
}
