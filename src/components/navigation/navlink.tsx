import Link from "next/link";
import Image from "next/image";

interface NavLinkProps {
  href: string;
  iconSrc: string;
  iconAlt: string;
  title: string;
  description: string;
  comingSoon?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, iconSrc, iconAlt, title, description, comingSoon }) => {
  return (
    <Link
      href={href}
      className="block p-3 rounded-lg transition-all duration-200 hover:bg-green-900 hover:bg-opacity-10"
    >
      <div className="flex items-start gap-3">
        <Image
          src={iconSrc}
          alt={iconAlt}
          width={24}
          height={24}
          className="w-8 h-auto mt-2"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl text-black">{title}</h3>
            {comingSoon && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-violet-800 bg-violet-100 rounded-full">
                <Image
                  src="/icons/line/ai-stars.svg"
                  alt=""
                  width={12}
                  height={12}
                  className="w-3 h-3"
                />
                Coming Soon
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default NavLink;
