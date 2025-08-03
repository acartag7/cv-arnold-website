'use client';

import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Linkedin, Github, Download } from 'lucide-react';
import { CVData } from '@/types';

interface HeroSectionProps {
  data: CVData;
}

export default function HeroSection({ data }: HeroSectionProps) {
  const { personalInfo, achievements } = data;

  const handleDownloadPDF = () => {
    window.print();
  };

  const contactLinks = [
    {
      icon: MapPin,
      text: personalInfo.location,
      href: null,
    },
    {
      icon: Mail,
      text: personalInfo.email,
      href: `mailto:${personalInfo.email}`,
    },
    {
      icon: Phone,
      text: personalInfo.phone,
      href: `tel:${personalInfo.phone}`,
    },
    {
      icon: Linkedin,
      text: personalInfo.linkedin,
      href: `https://${personalInfo.linkedin}`,
    },
  ];

  if (personalInfo.github) {
    contactLinks.push({
      icon: Github,
      text: personalInfo.github,
      href: `https://github.com/${personalInfo.github}`,
    });
  }

  return (
    <section id="hero" className="pt-24 pb-16 px-4 print:pt-0 print:pb-8">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* Left Column - Info */}
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-[var(--text)] mb-4">
                {personalInfo.name}
              </h1>
              <h2 className="text-xl lg:text-2xl text-[var(--primary)] font-semibold mb-6">
                {personalInfo.title}
              </h2>
              <p className="text-lg text-[var(--text-muted)] leading-relaxed">
                {data.summary}
              </p>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-2"
            >
              {contactLinks.map((contact, index) => {
                const IconComponent = contact.icon;
                const content = (
                  <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-[var(--surface)]/50 hover:bg-[var(--primary)] hover:text-white transition-all duration-200 group border border-[var(--primary)]/10">
                    <IconComponent size={18} className="text-[var(--primary)] group-hover:text-white flex-shrink-0" />
                    <span className="text-sm text-[var(--text)] group-hover:text-white font-medium">
                      {contact.text}
                    </span>
                  </div>
                );

                return contact.href ? (
                  <a
                    key={index}
                    href={contact.href}
                    target={contact.href.startsWith('http') ? '_blank' : undefined}
                    rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="block"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={index}>{content}</div>
                );
              })}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={handleDownloadPDF}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--secondary)] transition-all duration-200 font-semibold"
              >
                <Download size={20} />
                <span>Download CV</span>
              </button>
              <a
                href="#contact"
                className="flex items-center justify-center px-6 py-3 border-2 border-[var(--primary)] text-[var(--primary)] rounded-lg hover:bg-[var(--primary)] hover:text-white transition-all duration-200 font-semibold"
              >
                Let&apos;s Connect
              </a>
            </motion.div>
          </div>

          {/* Right Column - Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2 space-y-3"
          >
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="p-4 rounded-lg bg-[var(--surface)]/60 hover:bg-[var(--surface)] border border-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all duration-300 group"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-200">
                    {/* Icon placeholder - will be replaced with actual icons */}
                    <div className="w-4 h-4 bg-current rounded opacity-60"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--text)] mb-1 text-xs group-hover:text-[var(--primary)] transition-colors">
                      {achievement.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mb-1 leading-tight">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-[var(--primary)] font-medium">
                      {achievement.impact}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}