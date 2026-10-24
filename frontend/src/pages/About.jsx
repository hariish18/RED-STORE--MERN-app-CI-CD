import { Link } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import WhyChooseUsSection from '../components/WhyChooseUsSection';
import StatsSection from '../components/StatsSection';
import './About.css';

// store image (shoe box shelf) - to be replaced by a
// real Red Store shop/workshop photo when available
const STORY_IMAGE =
    'https://images.unsplash.com/photo-1761952199689-7bf870229d1e?q=80&w=1200&auto=format&fit=crop';

export default function About() {
    return (
        <div className="about-page">
            <section className="about-hero section">
                <SectionHeading title="Our Story" />
                <p className="about-hero__subtitle">
                    Red Store is a multi-brand shoe store — not just sneakers. We carry formal, casual, boots,
                    sandals and sport, curated from brands you trust and shipped straight to your door.
                </p>
            </section>

            <section className="about-story-section section">
                <Reveal className="about-story">
                    <h2 className="about-story__heading">Our Story</h2>
                    <p>
                        Red Store was born from a simple passion: finding the right pair of shoes should
                        never be a compromise between style, comfort and quality. What started as
                        a small selection curated for friends and family has grown into a multi-brand store designed
                        for the whole family — from the office to the playing field.
                    </p>
                    <p>
                        Every brand we carry is chosen with the same high standards: durable materials,
                        careful craftsmanship, and comfort that goes the distance. That is why
                        you will find everything from dressed-up classics to everyday essentials,
                        winter boots and summer sandals.
                    </p>
                    <p>
                        Today, our commitment remains the same as on day one: a rigorous selection,
                        fast delivery, and responsive customer service — so that choosing your shoes
                        remains a pleasure, from the first click to the first step.
                    </p>
                </Reveal>
                <Reveal className="about-story__image-wrapper" delay={0.1}>
                    <img
                        src={STORY_IMAGE}
                        alt="Red Store shoe boutique interior"
                        className="about-story__image"
                        loading="lazy"
                    />
                </Reveal>
            </section>

            <WhyChooseUsSection />

            <StatsSection />

            <section className="about-cta-section section">
                <Reveal className="about-cta">
                    <h2 className="about-cta__title">Ready to find your next pair?</h2>
                    <Link to="/shop" className="about-cta__btn">
                        Shop Now &rarr;
                    </Link>
                </Reveal>
            </section>
        </div>
    );
}
