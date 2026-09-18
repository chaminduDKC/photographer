import WhatsAppButton from '@/components/WhatsAppButton';

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 sm:py-28 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-sm font-medium text-brand-400 uppercase tracking-widest mb-2">
          Ready?
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-brand-900">
          Let&apos;s Work Together
        </h2>
        <p className="mt-4 text-brand-500 max-w-md mx-auto">
          Have a special event coming up? I&apos;d love to capture your precious moments. 
          Reach out via WhatsApp and let&apos;s discuss your vision.
        </p>
        <div className="mt-8">
          <WhatsAppButton text="Chat on WhatsApp" />
        </div>
      </div>
    </section>
  );
}
