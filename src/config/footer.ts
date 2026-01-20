import type { FooterProps } from '@/types/footer';

export const footerConfig: FooterProps = {
  logo: {
    src: "/images/turterra-logo-white-text.png",
    alt: "Turterra Logo"
  },
  sections: {
    tools: {
      title: "Tools",
      links: [
        { label: "Turtle Guide", href: "/turtle-guide" },
        { label: "Turtle Identifier", href: "/identifier" },
        { label: "Find a Vet", href: "/vets" }
      ],
      reachOut: {
        title: "Reach Out",
        links: [
          { label: "About", href: "/about" },
          { label: "Contact Us", href: "/contact" }
        ]
      }
    },
    community: {
      title: "Community",
      links: [
        { label: "Community Forums", href: "/forums" },
        { label: "Education", href: "/education" },
        { label: "Blog", href: "/blog" }
      ]
    },
    social: {
      title: "Follow us",
      links: [
        { label: "Facebook", href: "" },
        { label: "LinkedIn", href: "" },
        { label: "Youtube", href: "" },
        { label: "X", href: "" },
        { label: "Instagram", href: "" }
      ]
    }
  },
  newsletter: {
    title: "Join our newsletter to stay up to date on features and releases.",
    subtitle: "Subscribe to our newsletter",
    privacyText: "By subscribing you agree to with our Privacy Policy and provide consent to receive updates from our company."
  },
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookies Settings", href: "/cookies" }
  ]
}; 