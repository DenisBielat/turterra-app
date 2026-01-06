'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@/components/Icon'
import MobileNavLink from './mobile-navlink'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className="flex items-center justify-center p-2 text-green-950 hover:text-green-600 transition-colors"
          aria-label="Open menu"
        >
          <Icon name="nav-menu" style="line" size="lg" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
        <VisuallyHidden>
          <SheetTitle>Navigation Menu</SheetTitle>
        </VisuallyHidden>

        {/* Account Section */}
        <Link
          href="/account"
          onClick={closeMenu}
          className="flex items-center gap-3 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
            {/* Placeholder avatar - replace with actual user image when available */}
            <Icon name="face-id" style="line" size="xlg" className="text-green-700" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-black">My Account</span>
            <span className="text-xs text-green-700 font-medium">Hopeful Hatchling</span>
          </div>
        </Link>

        {/* Scrollable Menu Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Tools Section */}
          <div className="p-4">
            <p className="text-sm font-bold text-gray-400 px-3 mb-2">Tools</p>
            <MobileNavLink
              href="/species-guide"
              iconSrc="/images/nav-menu-icons/species-guide.png"
              iconAlt="Species Guide Icon"
              title="Species Guide"
              description="Find the species you're looking for"
              onClick={closeMenu}
            />
            <MobileNavLink
              href="/species-identifier"
              iconSrc="/images/nav-menu-icons/species-identifier.png"
              iconAlt="Species Identifier Icon"
              title="Species Identifier"
              description="Identify your turtle"
              onClick={closeMenu}
            />
          </div>

          {/* Community Section */}
          <div className="p-4 pt-0">
            <p className="text-sm font-bold text-gray-400 px-3 mb-2">Community</p>
            <MobileNavLink
              href="/forums"
              iconSrc="/images/nav-menu-icons/forums.png"
              iconAlt="Forums Icon"
              title="Forums"
              description="Join discussions about turtle care"
              onClick={closeMenu}
            />
            <MobileNavLink
              href="/guides"
              iconSrc="/images/nav-menu-icons/guides.png"
              iconAlt="Guides Icon"
              title="Guides"
              description="Learn about everything turtle related"
              onClick={closeMenu}
            />
            <MobileNavLink
              href="/blog"
              iconSrc="/images/nav-menu-icons/blog.png"
              iconAlt="Blog Icon"
              title="Blog"
              description="Latest articles and announcements"
              onClick={closeMenu}
            />
            <MobileNavLink
              href="/vets"
              iconSrc="/images/nav-menu-icons/vet-finder.png"
              iconAlt="Vet Finder Icon"
              title="Find a Vet"
              description="Vets that handle turtles with care"
              onClick={closeMenu}
            />
          </div>
        </div>

        {/* Donate Section - Fixed at bottom */}
        <div className="border-t border-gray-200 p-4 mt-auto">
          <Link
            href="/donate"
            onClick={closeMenu}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors"
          >
            <Icon name="hand-shake-heart" style="line" size="lg" />
            Donate
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileMenu
