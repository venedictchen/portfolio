import { DesktopNavbar } from "./elements/desktop-navbar";
import { MobileNavbar } from "./elements/mobile-navbar";

// Picking the navbar with a JS media query meant the server always rendered the
// mobile one, then desktop users got a swap after hydration. CSS decides now,
// so the right navbar is there from the first paint.
export const Navbar = () => (
  <>
    <div className="hidden min-[992px]:block">
      <DesktopNavbar />
    </div>
    <div className="min-[992px]:hidden">
      <MobileNavbar />
    </div>
  </>
);
