import Image from 'next/image'
import { useState } from 'react'

interface ProfileNavigationProps {
  name: string
  species: string
  imageUrl: string
}

export default function ProfileNavigation({ name, species, imageUrl }: ProfileNavigationProps) {
  const [activeSection, setActiveSection] = useState('intro')

  const navItems = [
    {
      id: 'intro',
      label: 'At a Glance',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M23.43 10.52c-2.64 -2.91 -7 -6 -11.43 -5.92S3.21 7.61 0.57 10.52a2.22 2.22 0 0 0 0 3C2.33 15.42 6.74 19.4 12 19.4s9.66 -4 11.43 -5.93a2.22 2.22 0 0 0 0 -2.95ZM7.4 12a4.6 4.6 0 1 1 4.6 4.6A4.6 4.6 0 0 1 7.4 12Z" fill="currentColor"/>
          <path d="M10 12a2 2 0 1 0 4 0 2 2 0 1 0 -4 0" fill="currentColor"/>
        </svg>
      )
    },
    // Add other nav items here...
  ]

  return (
    <div className="flex flex-col w-full">
      <div className="sticky top-40 bg-neutral rounded-2xl max-w-[15rem] w-full mb-8">
        <div className="flex flex-col items-center justify-center relative -mt-20 mb-4 text-center">
          <Image
            src={imageUrl}
            alt={name}
            width={160}
            height={160}
            className="rounded-full w-40 h-40 object-cover aspect-square"
          />
          <h5 className="heading-style-h5">{name}</h5>
          <div className="italic">{species}</div>
        </div>

        <div className="flex flex-col gap-2 p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-4 w-full px-4 py-2 rounded-lg transition-all duration-200 uppercase text-sm font-semibold
                ${activeSection === item.id 
                  ? 'bg-green-800 text-white' 
                  : 'hover:bg-green-800 hover:text-white'
                }`}
            >
              <span className="w-5 h-5">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 