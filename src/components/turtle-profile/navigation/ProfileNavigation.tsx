"use client";

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Icon } from '@/components/Icon'

interface ProfileNavigationProps {
  name: string
  species: string
  imageUrl: string
}

export const ProfileNavigation = ({ name, species, imageUrl }: ProfileNavigationProps) => {
  const [activeSection, setActiveSection] = useState('intro')
  
  // Add throttle utility
  const throttle = (func: Function, limit: number) => {
    let inThrottle: boolean
    return (...args: any[]) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  // Scroll handling logic
  useEffect(() => {
    const SCROLL_OFFSET = 100

    const getCurrentSection = () => {
      const sections = navItems.map(item => document.getElementById(item.id))
      let currentSection = ''
      let minDistance = Infinity

      sections.forEach(section => {
        if (!section) return
        const rect = section.getBoundingClientRect()
        const distance = Math.abs(rect.top - SCROLL_OFFSET)

        if (distance < minDistance) {
          minDistance = distance
          currentSection = section.id
        }
      })

      if (window.scrollY < SCROLL_OFFSET) {
        currentSection = 'intro'
      }

      return currentSection
    }

    const handleScroll = throttle(() => {
      const current = getCurrentSection()
      if (current) setActiveSection(current)
    }, 50)

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Navigation click handler
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (!element) return

    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - 100

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }

  if (!imageUrl) return null;

  const navItems = [
    {
      id: 'intro',
      label: 'At a Glance',
      icon: <Icon name="eyeball" style="filled" size="base" />
    },
    {
      id: 'identification',
      label: 'Identification',
      icon: <Icon name="marine-turtle" style="filled" size="base" />
    },
    {
      id: 'distribution',
      label: 'Distribution',
      icon: <Icon name="trip-map-markers" style="filled" size="base" />
    },
    {
      id: 'habitat',
      label: 'Habitat & Behavior',
      icon: <Icon name="outdoors-tree-valley" style="filled" size="base" />
    },
    {
      id: 'conservation',
      label: 'Conservation',
      icon: <Icon name="hand-shake-heart" style="filled" size="base" />
    }
  ]

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
      <div className="sticky top-40 z-[2] bg-neutral rounded-2xl w-full max-w-[15rem] mb-8">
        <div className="flex flex-col gap-4 items-center justify-center relative -mt-20 mb-4 text-center">
          <Image
            src={imageUrl}
            alt={`Profile image of ${name}`}
            width={160}
            height={160}
            className="rounded-full w-40 h-40 object-cover aspect-square"
          />
          <h5 className="font-heading font-bold text-2xl">{name}</h5>
          <div className="italic">{species}</div>
        </div>

        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`flex items-center gap-4 w-full px-4 py-2 rounded-lg transition-all duration-200 font-heading uppercase text-sm font-semibold
                ${activeSection === item.id 
                  ? 'bg-green-800 text-white' 
                  : 'hover:bg-green-800 hover:text-white'
                }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">{item.icon}</div>
              {item.label}
            </button>
          ))}
          
          <button
            onClick={scrollToTop}
            className="flex items-center gap-4 w-full px-4 py-2 rounded-lg transition-all duration-200 font-heading uppercase text-sm font-semibold hover:bg-green-800 hover:text-white"
          >
            <div className="w-5 h-5 flex items-center justify-center -rotate-90">
              <Icon name="arrow-right" style="filled" size="base"/>
            </div>
            Back to Top
          </button>
        </div>
      </div>
  )
} 