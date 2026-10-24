// Classes shared across profile subcomponents: reuses
// global utility classes from shared.css (already imported via index.css)
// rather than Tailwind, which is not configured in this project (no
// @tailwind directive, see postcss.config.js).
export const FIELD_INPUT_CLASS = "form-input";

export const messageClass = (type) => `form-message form-message--${type}`;
