import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import CategoriesSection from '../components/CategoriesSection';
import NewArrivalsSection from '../components/NewArrivalsSection';
import Testimonials from '../components/Testimonials';
import WhyChooseUsSection from '../components/WhyChooseUsSection';
import StatsSection from '../components/StatsSection';
import Footer from '../components/Footer';

// Scrolls to the section targeted by the URL hash (e.g. "/#new-arrivals").
// react-router does not handle this automatically, and the page arrives with a transition
// (PageTransition): the section does not exist yet on the first render when coming
// from another page, hence the small waiting loop.
// location.key is in the dependencies to re-scroll when clicking the
// same link again while the hash is already in the URL.
function useScrollToHash() {
    const { hash, key } = useLocation();

    useEffect(() => {
        if (!hash) return undefined;
        const id = decodeURIComponent(hash.slice(1));
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

        let attempts = 0;
        const timer = setInterval(() => {
            const target = document.getElementById(id);
            attempts += 1;
            if (target) {
                clearInterval(timer);
                target.scrollIntoView({ behavior, block: 'start' });
            } else if (attempts >= 20) {
                clearInterval(timer);
            }
        }, 50);

        return () => clearInterval(timer);
    }, [hash, key]);
}

function Home() {
    useScrollToHash();

    return (
        <div className="min-h-screen bg-white font-sans">
            <Hero />
            <CategoriesSection />
            <NewArrivalsSection />
            <WhyChooseUsSection />
            <StatsSection />
            <Testimonials />
            <Footer />
        </div>
    );
}

export default Home;
