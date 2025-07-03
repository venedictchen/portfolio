import { motion } from "framer-motion";
import { CONTACT_INFO } from "../constants";

export default function ContactInfo() {
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.6 }}
    >
      <div className="space-y-6">
        <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#fda237] to-[#fdc592]">
          Let&apos;s Connect
        </h3>
        <p className="text-white/80 text-lg leading-relaxed">
          I&apos;m always open to discussing new opportunities, interesting
          projects, or just having a chat about technology and development. Feel
          free to reach out!
        </p>
      </div>

      <div className="space-y-4">
        {CONTACT_INFO.map((info, index) => (
          <motion.div
            key={info.label}
            className="group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            {info.href ? (
              <a
                href={info.href}
                target={info.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  info.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#471b1c]/50 to-[#5c2318]/50 rounded-2xl border border-[#fda237]/20 hover:border-[#fda237]/40 transition-all duration-300 group-hover:scale-105"
              >
                <div className="bg-gradient-to-br from-[#fda237] to-[#fdc592] p-3 rounded-xl">
                  <info.icon className="w-5 h-5 text-[#2a0f10]" />
                </div>
                <div>
                  <p className="text-[#fdc592] font-medium">{info.label}</p>
                  <p className="text-white/80">{info.value}</p>
                </div>
              </a>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#471b1c]/50 to-[#5c2318]/50 rounded-2xl border border-[#fda237]/20">
                <div className="bg-gradient-to-br from-[#fda237] to-[#fdc592] p-3 rounded-xl">
                  <info.icon className="w-5 h-5 text-[#2a0f10]" />
                </div>
                <div>
                  <p className="text-[#fdc592] font-medium">{info.label}</p>
                  <p className="text-white/80">{info.value}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
