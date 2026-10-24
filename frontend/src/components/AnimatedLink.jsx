import { Link } from 'react-router-dom';

// Uses "to" for internal route (react-router client navigation) or
// "href" for external link/anchor - same rendering/animation in both cases
export default function AnimatedLink({ href, to, children }) {
    const content = (
        <>
            {/* text */}
            <span className="text-gray-700 hover:text-[#E63946] transition-colors duration-300">
                {children}
            </span>

            {/* Animated underline */}
            <span
                className="absolute left-0 bottom-0 h-[2px] w-full bg-[#E63946]"
                style={{
                    transform: 'scaleX(0)',
                    transformOrigin: 'right',
                    transition: 'transform 0.3s ease',
                }}
            />
            {/* CSS to animate on hover */}
            <style>{`
        .group:hover span {
          transform: scaleX(1) !important;
          transformOrigin: left !important;
        }
      `}</style>
        </>
    );

    if (to) {
        return (
            <Link to={to} className="group relative inline-block" style={{ textDecoration: 'none' }}>
                {content}
            </Link>
        );
    }

    return (
        <a href={href} className="group relative inline-block" style={{ textDecoration: 'none' }}>
            {content}
        </a>
    );
}
