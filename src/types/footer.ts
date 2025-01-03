export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  logo: {
    src: string;
    alt: string;
  };
  sections: {
    tools: {
      title: string;
      links: FooterLink[];
      reachOut: {
        title: string;
        links: FooterLink[];
      };
    };
    community: FooterSection;
    social: {
      title: string;
      links: FooterLink[];
    };
  };
  newsletter: {
    title: string;
    subtitle: string;
    privacyText: string;
  };
  legal: FooterLink[];
} 