import { motion } from "framer-motion";
export const Footer = () => {
  return (
    <footer className="py-8 px-4 bg-dark-brown text-center text-white/60">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-white/60">
          © {new Date().getFullYear()} | All right reserved Venedict Chen
        </p>
      </motion.div>
    </footer>
  );
};

export default Footer;
