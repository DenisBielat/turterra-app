'use client'

import Image from 'next/image'
import Link from 'next/link'
import NavLink from './navlink'
import MobileMenu from './mobile-menu'
import { Icon } from '@/components/Icon'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu"

const Navbar = () => {
  const { scrollDirection, isAtTop } = useScrollDirection(50);
  const isVisible = isAtTop || scrollDirection === 'up';

  return (
    <>
      {/* Mobile Header */}
      <header
        className={`lg:hidden fixed top-0 z-50 w-full border-b border-white border-opacity-20 bg-green-950 py-1 px-4 transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex h-12 items-center justify-between">
          {/* Left: Menu Button + Logo */}
          <div className="flex items-center gap-2">
            <MobileMenu />
            <Link href="/">
              <Image
                src="/images/turterra-logo-white-text.png"
                alt="Turterra"
                width={100}
                height={27}
                className="h-auto w-auto"
              />
            </Link>
          </div>

          {/* Right: Search + Login */}
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="flex items-center justify-center p-2 text-white hover:text-green-400 transition-colors"
              aria-label="Search"
            >
              <Icon name="search" style="line" size="base" />
            </Link>
            <Link
              href="/login"
              className="font-semibold text-white border-2 border-warm rounded-full px-4 py-1.5 text-sm hover:text-green-950 hover:bg-warm transition-all"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>
      {/* Mobile header spacer */}
      <div className="lg:hidden h-14" />

      {/* Desktop Header */}
      <header
        className={`hidden lg:block fixed top-0 z-50 w-full border-b border-white border-opacity-20 bg-green-950 py-2 px-10 transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto max-w-8xl flex h-16 items-center justify-between">
          <div className="flex items-center gap-16">
            <Link href="/" className="flex-shrink-0">
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
                        href="/species-guide"
                        iconSrc="/images/nav-menu-icons/species-guide.png"
                        iconAlt="Species Guide Icon"
                        title="Species Guide"
                        description="Find the species you're looking for or just browse for fun"
                      />
                      <NavLink
                        href="/species-identifier"
                        iconSrc="/images/nav-menu-icons/species-identifier.png"
                        iconAlt="Species Identifier Icon"
                        title="Species Identifier"
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
                    <Link href="/donate" className='hover:text-green-600 transition-all'>
                      Donate
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="font-semibold text-white border-2 border-warm rounded-full px-6 py-3 hover:text-green-950 hover:bg-warm transition-all"
            >
              Log in
            </Link>
            <Link
              href="/join"
              className="font-semibold rounded-full border-2 border-green-600 bg-green-600 px-6 py-3 text-white hover:bg-green-900 hover:border-green-900 transition-all"
            >
              Join the Community
            </Link>
          </div>
        </div>
      </header>
      {/* Desktop header spacer */}
      <div className="hidden lg:block h-20" />
    </>
  )
}

export default Navbar