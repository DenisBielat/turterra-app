'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Icon } from '@/components/Icon'
import { UserAvatar } from '@/components/user-avatar'
import { useAuthModal } from '@/components/auth/auth-modal-provider'
import { signOut } from '@/app/actions/auth'
import MobileNavLink from './mobile-navlink'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface UserProfile {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface MobileMenuProps {
  user: UserProfile | null;
}

const MobileMenu = ({ user }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { openModal } = useAuthModal()

  const closeMenu = () => setIsOpen(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className="flex items-center justify-center p-2 text-white hover:text-green-400 transition-colors"
          aria-label="Open menu"
        >
          <Icon name="nav-menu" style="line" size="lg" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col bg-warm">
        <VisuallyHidden>
          <SheetTitle>Navigation Menu</SheetTitle>
        </VisuallyHidden>

        {/* Account Section */}
        {user ? (
          <Link
            href={`/user/${user.username}`}
            onClick={closeMenu}
            className="flex items-center gap-3 p-4 border-b border-gray-300 border-opacity-50 hover:bg-white hover:bg-opacity-50 transition-colors"
          >
            <UserAvatar
              avatarUrl={user.avatar_url}
              displayName={user.display_name}
              username={user.username}
              size="lg"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-black">
                {user.display_name || user.username}
              </span>
              <span className="text-xs text-gray-500">@{user.username}</span>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3 p-4 border-b border-gray-300 border-opacity-50">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
              <Icon name="face-id" style="line" size="xlg" className="text-green-700" />
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => { closeMenu(); openModal("login"); }}
                className="text-sm font-semibold text-green-700 hover:text-green-900 text-left"
              >
                Log in
              </button>
              <button
                onClick={() => { closeMenu(); openModal("join"); }}
                className="text-xs text-gray-500 hover:text-gray-700 text-left"
              >
                or Join the Community
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Menu Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Tools Section */}
          <div className="p-4">
            <p className="text-sm font-bold text-gray-400 px-3 mb-2">Tools</p>
            <MobileNavLink
              href="/turtle-guide"
              iconSrc="/images/nav-menu-icons/species-guide.png"
              iconAlt="Turtle Guide Icon"
              title="Turtle Guide"
              description="Find the turtle you're looking for"
              onClick={closeMenu}
            />
            <MobileNavLink
              href="/species-identifier"
              iconSrc="/images/nav-menu-icons/species-identifier.png"
              iconAlt="Turtle Identifier Icon"
              title="Turtle Identifier"
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

        {/* Bottom section */}
        <div className="border-t border-gray-300 border-opacity-50 p-4 mt-auto space-y-3">
          {user && (
            <button
              onClick={() => { closeMenu(); signOut(); }}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 text-red-600 font-medium rounded-full border border-red-200 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          )}
          <a
            href="https://buymeacoffee.com/turterra"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors"
          >
            <Icon name="hand-shake-heart" style="line" size="lg" />
            Donate
          </a>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileMenu
