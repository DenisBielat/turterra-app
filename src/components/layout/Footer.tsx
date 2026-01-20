'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { FooterProps, FooterLink } from '@/types/footer';
import { Icon } from '@/components/Icon';
import type { FilledIconName, LineIconName } from '@/types/icons';

// Update the social media icon config
const socialIconConfig: Record<string, { name: FilledIconName | LineIconName; style: 'line' | 'filled' }> = {
  Facebook: { name: 'facebook', style: 'filled' },
  LinkedIn: { name: 'linkedin', style: 'filled' },
  Youtube: { name: 'youtube', style: 'filled' },
  X: { name: 'twitter', style: 'line' },
  Instagram: { name: 'instagram', style: 'line' }
};

export function Footer({ logo, sections, newsletter, legal }: FooterProps) {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Add newsletter subscription logic here
  };

  return (
    <footer className="bg-green-900 bg-[url('/images/textures/turtle-shell-texture-1.png')] bg-[length:235rem_auto] relative isolate">
      <div className="absolute inset-0 bg-green-900 opacity-95"></div>
      <div className="relative z-10 text-white">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="py-16">
              <div className="pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-[0.75fr,1fr] gap-8 lg:gap-[8vw]">
                  {/* Left Column */}
                  <div className="flex flex-col">
                    <Link href="/" className="w-fit" aria-label="Turterra Home">
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={240}
                        height={60}
                        className="h-12 w-auto"
                        sizes="(max-width: 768px) 100vw, 32vw"
                      />
                    </Link>
                    <div className="mt-6">
                      <p className="text-base">{newsletter.title}</p>
                      <form onSubmit={handleSubscribe} className="mt-4 max-w-[35rem]">
                        <div className="flex gap-4 mb-3">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="flex-1 min-w-0 px-4 py-2 text-gray-900 rounded-sm border border-transparent transition-all duration-200 focus:border-green-500 focus:shadow-[0_0_0.25rem_0.03125rem_theme(colors.green.200)] focus:outline-none"
                            required
                          />
                          <button
                            type="submit"
                            className="bg-green-600 px-4 py-2 border-2 border-green-600 rounded-sm font-semibold hover:bg-green-800 hover:border-green-800 transition-all"
                          >
                            Subscribe
                          </button>
                        </div>
                      </form>
                      <p className="mt-2 text-xs text-gray-300">
                        By subscribing you agree to with our{' '}
                        <Link 
                          href="/privacy" 
                          className="text-green-500 underline hover:text-green-200 transition-colors"
                        >
                          Privacy Policy
                        </Link>
                        {' '}and provide consent to receive updates from our company.
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Navigation Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-8 sm:gap-8">
                    {/* Tools Section with Reach Out */}
                    <div className="flex flex-col">
                      <h3 className="font-body font-semibold text-sm text-gray-200">{sections.tools.title}</h3>
                      <div className="mt-2 flex flex-col">
                        {sections.tools.links.map((link) => (
                          <Link
                            key={`tools-${link.label}`}
                            href={link.href}
                            className="py-2 font-bold hover:text-green-500 transition-colors"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>

                      <h3 className="font-body font-semibold text-sm text-gray-200 mt-6">{sections.tools.reachOut.title}</h3>
                      <div className="mt-2 flex flex-col">
                        {sections.tools.reachOut.links.map((link) => (
                          <Link
                            key={`reach-out-${link.label}`}
                            href={link.href}
                            className="py-2 font-bold hover:text-green-500 transition-colors"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Community Section */}
                    <div className="flex flex-col">
                      <h3 className="font-body font-semibold text-sm text-gray-200">{sections.community.title}</h3>
                      <div className="mt-2 flex flex-col">
                        {sections.community.links.map((link) => (
                          <Link
                            key={`community-${link.label}`}
                            href={link.href}
                            className="py-2 font-bold hover:text-green-500 transition-colors"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Social Links Section - Hidden on mobile, shown on sm+ */}
                    <div className="hidden sm:flex flex-col">
                      <h3 className="font-body font-semibold text-sm text-gray-200">{sections.social.title}</h3>
                      <div className="mt-2 flex flex-col">
                        {sections.social.links.map((link: FooterLink) => (
                          <Link
                            key={`social-${link.label}`}
                            href={link.href}
                            className="py-2 flex items-center gap-3 font-bold hover:text-green-500 transition-colors"
                          >
                            <Icon
                              name={socialIconConfig[link.label].name}
                              style={socialIconConfig[link.label].style}
                              size="base"
                            />
                            <span>{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Social Icons - Shown only on mobile */}
                  <div className="flex sm:hidden gap-4 mt-8">
                    {sections.social.links.map((link: FooterLink) => (
                      <Link
                        key={`social-mobile-${link.label}`}
                        href={link.href}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        aria-label={link.label}
                      >
                        <Icon
                          name={socialIconConfig[link.label].name}
                          style={socialIconConfig[link.label].style}
                          size="base"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="border-t border-neutral-200/20 pt-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-gray-200">© 2025 Turterra. All rights reserved.</p>
                  <div className="flex gap-6">
                    {legal.map((link) => (
                      <Link
                        key={`legal-${link.label}`}
                        href={link.href}
                        className="text-sm text-gray-200 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 