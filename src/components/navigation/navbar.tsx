'use client'

import Image from 'next/image'
import Link from 'next/link'
// import { useState } from 'react'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-green-950">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
        {/* Logo and Nav grouped together */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/turterra-logo-white-text.png"
              alt="Turterra"
              width={120}
              height={32}
              className="h-auto w-auto"
            />
          </Link>

          {/* Main Navigation */}
          <NavigationMenu>
            <NavigationMenuList className="gap-6">
              <NavigationMenuItem>
                <Link href="/tools" legacyBehavior passHref>
                  <NavigationMenuLink className="font-averta text-white hover:text-green-600 bg-transparent">
                    Tools
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/community" legacyBehavior passHref>
                  <NavigationMenuLink className="font-averta text-white hover:text-green-600 bg-transparent">
                    Community
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/donate" legacyBehavior passHref>
                  <NavigationMenuLink className="font-averta text-white hover:text-green-600 bg-transparent">
                    Donate
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="font-averta text-white hover:text-green-600"
          >
            Log in
          </Link>
          <Link
            href="/join"
            className="rounded-full bg-green-600 px-4 py-2 font-averta text-white hover:bg-green-600/90"
          >
            Join the Community
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar