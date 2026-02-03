'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import NavLink from './navlink'
import MobileMenu from './mobile-menu'
import { Icon } from '@/components/Icon'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { useAuthModal } from '@/components/auth/auth-modal-provider'
import { UserAvatar } from '@/components/user-avatar'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/app/actions/auth'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu"

interface UserProfile {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

const Navbar = () => {
  const { scrollDirection, isAtTop } = useScrollDirection(50);
  const isVisible = isAtTop || scrollDirection === 'up';
  const { openModal } = useAuthModal();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch auth state and profile on mount + auth changes
  useEffect(() => {
    const supabase = createClient();

    const fetchProfile = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser(profile);
      } else {
        setUser(null);
      }
    };

    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <>
      {/* Mobile Header */}
      <header
        className={`lg:hidden fixed top-0 z-50 w-full border-b border-white border-opacity-20 bg-green-950 py-1 px-4 transition-transform duration-300 before:absolute before:inset-x-0 before:bottom-full before:h-20 before:bg-green-950 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex h-12 items-center justify-between">
          {/* Left: Menu Button + Logo */}
          <div className="flex items-center gap-2">
            <MobileMenu user={user} />
            <Link href="/" aria-label="Turterra Home">
              <Image
                src="/images/turterra-logo-white-text.png"
                alt="Turterra"
                width={100}
                height={27}
                className="h-auto w-auto"
              />
            </Link>
          </div>

          {/* Right: Search + Auth */}
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="flex items-center justify-center p-2 text-white hover:text-green-400 transition-colors"
              aria-label="Search"
            >
              <Icon name="search" style="line" size="base" />
            </Link>
            {user ? (
              <Link href={`/user/${user.username}`}>
                <UserAvatar
                  avatarUrl={user.avatar_url}
                  displayName={user.display_name}
                  username={user.username}
                  size="sm"
                />
              </Link>
            ) : (
              <button
                onClick={() => openModal("login")}
                className="font-semibold text-white border-2 border-warm rounded-full px-4 py-1.5 text-sm hover:text-green-950 hover:bg-warm transition-all"
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </header>
      {/* Mobile header spacer */}
      <div className="lg:hidden h-14" />

      {/* Desktop Header */}
      <header
        className={`hidden lg:block fixed top-0 z-50 w-full border-b border-white border-opacity-20 bg-green-950 py-2 px-10 transition-transform duration-300 before:absolute before:inset-x-0 before:bottom-full before:h-20 before:bg-green-950 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto max-w-8xl flex h-16 items-center justify-between">
          <div className="flex items-center gap-16">
            <Link href="/" className="flex-shrink-0" aria-label="Turterra Home">
              <Image
                src="/images/turterra-logo-white-text.png"
                alt="Turterra"
                width={120}
                height={32}
                className="h-auto w-auto"
              />
            </Link>

            <NavigationMenu>
              <NavigationMenuList className="gap-8">
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    Tools
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4">
                      <div>
                        <p className="text-sm font-bold text-gray-400 px-3">Tools</p>
                      </div>
                      <NavLink
                        href="/turtle-guide"
                        iconSrc="/images/nav-menu-icons/species-guide.png"
                        iconAlt="Turtle Guide Icon"
                        title="Turtle Guide"
                        description="Find the turtle you're looking for or just browse for fun"
                      />
                      <NavLink
                        href="/species-identifier"
                        iconSrc="/images/nav-menu-icons/species-identifier.png"
                        iconAlt="Turtle Identifier Icon"
                        title="Turtle Identifier"
                        description="Identify your turtle and get more information"
                      />
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    Community
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4">
                      <div>
                        <p className="text-sm font-bold text-gray-400 px-3">Community Resources</p>
                      </div>
                      <NavLink
                        href="/forums"
                        iconSrc="/images/nav-menu-icons/forums.png"
                        iconAlt="Forums Icon"
                        title="Forums"
                        description="Join discussions about turtle care and conservation"
                      />
                      <NavLink
                        href="/guides"
                        iconSrc="/images/nav-menu-icons/guides.png"
                        iconAlt="Guides Icon"
                        title="Guides"
                        description="Learn more about everything turtle related"
                      />
                      <NavLink
                        href="/blog"
                        iconSrc="/images/nav-menu-icons/blog.png"
                        iconAlt="Blog Icon"
                        title="Blog"
                        description="Our latest articles and announcements"
                      />
                      <NavLink
                        href="/vets"
                        iconSrc="/images/nav-menu-icons/vet-finder.png"
                        iconAlt="Vet Finder Icon"
                        title="Find a Vet"
                        description="Vets near you that are known to handle turtles with care"
                      />
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <a
                      href="https://buymeacoffee.com/turterra"
                      target="_blank"
                      rel="noopener noreferrer"
                      className='hover:text-green-600 transition-all'
                    >
                      Donate
                    </a>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side: Auth buttons or User menu */}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 rounded-full p-1 pr-3 hover:bg-white/10 transition-colors"
              >
                <UserAvatar
                  avatarUrl={user.avatar_url}
                  displayName={user.display_name}
                  username={user.username}
                  size="sm"
                />
                <span className="text-white text-base font-semibold hidden xl:block">
                  {user.display_name || user.username}
                </span>
                <svg
                  className={`w-4 h-4 text-white/70 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-lg border-2 border-green-950 p-3 z-50 origin-top-right animate-in fade-in zoom-in-90 duration-150">
                  {/* User info header with avatar */}
                  <div className="flex items-center gap-3 px-3 py-3">
                    <UserAvatar
                      avatarUrl={user.avatar_url}
                      displayName={user.display_name}
                      username={user.username}
                      size="md"
                    />
                    <div>
                      <p className="font-semibold text-green-950 text-sm">
                        {user.display_name || user.username}
                      </p>
                      <p className="text-gray-500 text-xs">@{user.username}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 my-1 mx-2" />

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href={`/user/${user.username}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-green-900 hover:bg-opacity-10 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-green-900 hover:bg-opacity-10 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>
                  </div>

                  <div className="border-t border-gray-200 my-1 mx-2" />

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => openModal("login")}
                className="font-semibold text-white border-2 border-warm rounded-full px-6 py-3 hover:text-green-950 hover:bg-warm transition-all"
              >
                Log in
              </button>
              <button
                onClick={() => openModal("join")}
                className="font-semibold rounded-full border-2 border-green-600 bg-green-600 px-6 py-3 text-white hover:bg-green-900 hover:border-green-900 transition-all"
              >
                Join the Community
              </button>
            </div>
          )}
        </div>
      </header>
      {/* Desktop header spacer */}
      <div className="hidden lg:block h-20" />
    </>
  )
}

export default Navbar
