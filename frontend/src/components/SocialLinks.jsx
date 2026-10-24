// Social media icons shared between footer and Contact page,
// to avoid duplicating the same SVG markup in two places

// TODO: Replace with real RedStore accounts once created
// (e.g. https://www.instagram.com/<account>); meanwhile, each icon opens
// the network homepage rather than an inactive "#".
const SOCIAL_URLS = {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    twitter: "https://twitter.com/",
};

// target="_blank" + rel="noopener noreferrer": external link, keeps site page open
const externalProps = { target: "_blank", rel: "noopener noreferrer" };

export default function SocialLinks({ className = "" }) {
    return (
        <div className={className}>
            <a href={SOCIAL_URLS.instagram} aria-label="RedStore on Instagram" {...externalProps}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
                </svg>
            </a>
            <a href={SOCIAL_URLS.facebook} aria-label="RedStore on Facebook" {...externalProps}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                        d="M14 9h3V6h-3c-1.66 0-3 1.34-3 3v2H9v3h2v6h3v-6h3l1-3h-4V9c0-.55.45-1 1-1Z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                    />
                </svg>
            </a>
            <a href={SOCIAL_URLS.twitter} aria-label="RedStore on Twitter" {...externalProps}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                        d="M21 5.5c-.7.3-1.5.6-2.2.7.8-.5 1.4-1.2 1.7-2.1-.8.5-1.6.8-2.5 1a4 4 0 0 0-6.8 3.6A11.3 11.3 0 0 1 3 4.6a4 4 0 0 0 1.2 5.3c-.6 0-1.2-.2-1.7-.5v.1a4 4 0 0 0 3.2 3.9c-.6.2-1.2.2-1.7.1a4 4 0 0 0 3.7 2.8A8 8 0 0 1 2 18.4a11.3 11.3 0 0 0 6.1 1.8c7.3 0 11.3-6 11.3-11.3v-.5c.8-.6 1.4-1.3 1.9-2.1Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                    />
                </svg>
            </a>
        </div>
    );
}
