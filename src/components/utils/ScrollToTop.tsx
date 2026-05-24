import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force scroll to top on route change
    window.scrollTo(0, 0);
    
    // Kill all active scroll triggers to prevent conflicts
    // ScrollTrigger.getAll().forEach(t => t.kill()); 
    // Actually, useGSAP usually handles this, but refreshing is safer for dynamic layouts
    
    // Recalculate ScrollTrigger positions
    ScrollTrigger.refresh();
    
    // Add a slight delay for lazy-loaded content or animations to finish mounting
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
