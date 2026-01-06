import Link from "next/link";
import Image from "next/image";

interface MobileNavLinkProps {
  href: string;
  iconSrc: string;
  iconAlt: string;
  title: string;
  description: string;
  onClick?: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({
  href,
  iconSrc,
  iconAlt,
  title,
  description,
  onClick
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block p-3 rounded-lg transition-all duration-200 hover:bg-green-900 hover:bg-opacity-10"
    >
      <div className="flex items-start gap-3">
        <Image
          src={iconSrc}
          alt={iconAlt}
          width={24}
          height={24}
          className="w-6 h-auto mt-1"
        />
        <div className="flex flex-col">
          <h3 className="text-lg font-medium text-black">{title}</h3>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default MobileNavLink;
