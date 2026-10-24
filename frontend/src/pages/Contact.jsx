import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import SocialLinks from '../components/SocialLinks';
import { validateContact } from '../utils/validators';
import './Contact.css';

const initialData = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
    const [data, setData] = useState(initialData);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (field) => (e) => setData({ ...data, [field]: e.target.value });

    // no contact endpoint on the backend yet: client-side validation
    // only, the submission is simulated locally
    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateContact(data);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            setSubmitted(true);
            setData(initialData);
        }
    };

    return (
        <div className="contact-page">
            <section className="section contact-hero">
                <SectionHeading title="Get In Touch" />
                <p className="contact-hero__subtitle">
                    Questions about an order, a product, or anything else? We&apos;re here to help.
                </p>
            </section>

            <section className="section contact-layout">
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                    <label>
                        Name
                        <input
                            className="form-input"
                            value={data.name}
                            onChange={handleChange('name')}
                            placeholder="Your name"
                        />
                        {errors.name && <span className="contact-form__error">{errors.name}</span>}
                    </label>

                    <label>
                        Email
                        <input
                            type="email"
                            className="form-input"
                            value={data.email}
                            onChange={handleChange('email')}
                            placeholder="you@example.com"
                        />
                        {errors.email && <span className="contact-form__error">{errors.email}</span>}
                    </label>

                    <label>
                        Subject
                        <input
                            className="form-input"
                            value={data.subject}
                            onChange={handleChange('subject')}
                            placeholder="How can we help?"
                        />
                        {errors.subject && <span className="contact-form__error">{errors.subject}</span>}
                    </label>

                    <label>
                        Message
                        <textarea
                            className="form-input"
                            rows={5}
                            value={data.message}
                            onChange={handleChange('message')}
                            placeholder="Tell us more..."
                        />
                        {errors.message && <span className="contact-form__error">{errors.message}</span>}
                    </label>

                    {submitted && (
                        <p className="form-message form-message--success">
                            Thanks — your message has been sent. We&apos;ll get back to you soon.
                        </p>
                    )}

                    <button type="submit" className="btn-primary contact-form__submit">
                        Send Message
                    </button>
                </form>

                <aside className="contact-info">
                    <h3 className="contact-info__heading">Contact Information</h3>

                    <a href="mailto:hello@redstore.com" className="contact-info__row">
                        <Mail size={20} strokeWidth={2} />
                        <span>hello@redstore.com</span>
                    </a>

                    <a href="tel:+21670123456" className="contact-info__row">
                        <Phone size={20} strokeWidth={2} />
                        <span>+216 70 123 456</span>
                    </a>

                    <div className="contact-info__row contact-info__row--static">
                        <MapPin size={20} strokeWidth={2} />
                        <span>12 Avenue Habib Bourguiba, Tunis, Tunisia</span>
                    </div>

                    <h3 className="contact-info__heading contact-info__heading--social">Follow Us</h3>
                    <SocialLinks className="contact-info__social" />
                </aside>
            </section>
        </div>
    );
}
