"use client";

import Image from 'next/image'
import { useState } from 'react'
import { Icon } from '@/components/Icon'

interface ProfileNavigationProps {
  name: string
  species: string
  imageUrl: string
}

export const ProfileNavigation = ({ name, species, imageUrl }: ProfileNavigationProps) => {
  const [activeSection, setActiveSection] = useState('intro')

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
    <div className="flex flex-col w-full">
      <div className="sticky top-40 bg-neutral rounded-2xl max-w-[15rem] w-full mb-4">
        <div className="flex flex-col gap-2 items-center justify-center relative -mt-20 mb-4 text-center">
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
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-4 w-full px-4 py-2 rounded-lg transition-all duration-200 font-heading uppercase text-sm font-semibold
                ${activeSection === item.id 
                  ? 'bg-green-800 text-white' 
                  : 'hover:bg-green-800 hover:text-white'
                }`}
            >
              <span className="w-5 h-5">{item.icon}</span>
              {item.label}
            </button>
          ))}
          
          <button
            onClick={scrollToTop}
            className="flex items-center gap-4 w-full px-4 py-2 rounded-lg transition-all duration-200 font-heading uppercase text-sm font-semibold hover:bg-green-800 hover:text-white"
          >
            <span className="w-5 h-5 -rotate-90">
              <Icon name="arrow-right" style="filled" size="base"/>
            </span>
            Back to Top
          </button>
        </div>
      </div>
    </div>
  )
} 