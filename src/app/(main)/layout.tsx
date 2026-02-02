import Navbar from "@/components/navigation/navbar";
import { Footer } from "@/components/layout/Footer";
import { footerConfig } from "@/config/footer";

/**
 * Main Layout
 *
 * Layout for pages that should include the navigation bar and footer.
 * This includes the home page, turtle guide, and other public pages.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer {...footerConfig} />
    </>
  );
}
