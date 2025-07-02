"use client";

import { Send} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContactForm } from "../hooks";

export function ContactForm() {
  const {
    formData,
    submitState,
    handleInputChange,
    handleSubmit,
  } = useContactForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-[#fdc592] font-medium">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-[#2a0f10]/50 border border-[#fda237]/30 rounded-xl text-white placeholder-white/50 focus:border-[#fda237] focus:outline-none focus:ring-2 focus:ring-[#fda237]/20 transition-all duration-300"
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-[#fdc592] font-medium">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-[#2a0f10]/50 border border-[#fda237]/30 rounded-xl text-white placeholder-white/50 focus:border-[#fda237] focus:outline-none focus:ring-2 focus:ring-[#fda237]/20 transition-all duration-300"
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-[#fdc592] font-medium">
          Subject *
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 bg-[#2a0f10]/50 border border-[#fda237]/30 rounded-xl text-white placeholder-white/50 focus:border-[#fda237] focus:outline-none focus:ring-2 focus:ring-[#fda237]/20 transition-all duration-300"
          placeholder="Subject of your message"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-[#fdc592] font-medium">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          required
          rows={4}
          className="w-full px-4 py-3 bg-[#2a0f10]/50 border border-[#fda237]/30 rounded-xl text-white placeholder-white/50 focus:border-[#fda237] focus:outline-none focus:ring-2 focus:ring-[#fda237]/20 transition-all duration-300"
          placeholder="Your message here..."
        />
      </div>

      <Button
        type="submit"
        disabled={submitState.isSubmitting}
        className="w-full cursor-pointer bg-[#fda237] text-[#2a0f10] hover:bg-[#fdc592] transition-colors duration-300 flex items-center justify-center gap-2"
      >
        {submitState.isSubmitting ? (
          <span>Sending...</span>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Send Message
          </>
        )}
      </Button>
    </form>
  );
}
