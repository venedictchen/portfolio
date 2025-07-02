import { useState } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "";
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "";

export function useContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitState, setSubmitState] = useState<{
    isSubmitting: boolean;
    status: "idle" | "success" | "error";
  }>({
    isSubmitting: false,
    status: "idle",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState({ isSubmitting: true, status: "idle" });

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        PUBLIC_KEY
      );

      setSubmitState({ isSubmitting: false, status: "success" });

      toast.success("Message sent successfully!", {
        style: {
          background: "#8dcd25", // color-success
          color: "#471b1c",      // dark-brown text
          border: "2px solid #5a130f", // dark-red border
        },
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("EmailJS error:", error);
      setSubmitState({ isSubmitting: false, status: "error" });

      toast.error("There was an error sending your message.", {
        style: {
          background: "#e60000", // color-danger
          color: "white",
          border: "2px solid #8b0000", // red border
        },
      });
    } finally {
      setTimeout(() => {
        setSubmitState((prev) => ({ ...prev, status: "idle" }));
      }, 5000);
    }
  };

  return {
    formData,
    submitState,
    handleInputChange,
    handleSubmit,
  };
}
