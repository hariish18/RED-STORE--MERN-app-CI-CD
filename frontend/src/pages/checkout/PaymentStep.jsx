import { motion } from "framer-motion";

function PaymentStep({ cardError, onNext, onBack, children }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onNext({ method: "card" });
    };

    return (
        <motion.form
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="checkout-form"
            onSubmit={handleSubmit}
            noValidate
        >
            <h3>Payment</h3>

            <p className="checkout-form__hint text-small home__muted">
                Secured payment by Stripe. Test card: <strong>4242 4242 4242 4242</strong>
            </p>

            <label className="stripe-card-label">
                Card details
                <div className="stripe-card-element">{children}</div>
            </label>
            {cardError && <span className="checkout-form__error">{cardError}</span>}

            <div className="checkout-form__actions">
                <button type="button" className="btn-secondary" onClick={onBack}>
                    Back
                </button>
                <button type="submit" className="btn-primary">
                    Review Order
                </button>
            </div>
        </motion.form>
    );
}

export default PaymentStep;
