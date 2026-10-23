"use client";

import { fieldClass } from "../constants";
import { useContactForm } from "../hooks";

export function ContactForm() {
  const { formData, submitState, handleInputChange, handleSubmit } =
    useContactForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="block font-medium text-cream">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className={fieldClass}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="block font-medium text-cream">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={fieldClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="block font-medium text-cream">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          required
          className={fieldClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="block font-medium text-cream">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          required
          rows={5}
          className={fieldClass}
        />
      </div>

      <button
        type="submit"
        disabled={submitState.isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-amber px-6 font-semibold text-page transition-colors hover:bg-peach disabled:opacity-60"
      >
        {submitState.isSubmitting ? "Sending message…" : "Send message"}
      </button>
    </form>
  );
}
