'use client'

import Image from 'next/image'
import Link from 'next/link'
import NavLink from './navlink'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu"

const Navbar = () => {
  return (
    <header className="top-0 z-50 w-full border-b border-white border-opacity-20 bg-green-950 py-2 px-4 lg:px-10">
      <div className="container mx-auto max-w-8xl flex h-16 items-center justify-between">
        <div className="flex items-center gap-8 lg:gap-16">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/turterra-logo-white-text.png"
              alt="Turterra"
              width={120}
              height={32}
              className="h-auto w-auto"
            />
          </Link>

          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <NavigationMenu className="hidden lg:flex">
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

        {/* Desktop Action Buttons - Hidden on mobile/tablet */}
        <div className="hidden lg:flex items-center gap-4">
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
  )
}

export default Navbar