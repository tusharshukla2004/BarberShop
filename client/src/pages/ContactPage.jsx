import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import Seo from '@/components/common/Seo';
import PageBanner from '@/components/common/PageBanner';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MapView from '@/components/common/MapView';
import { siteConfig } from '@/config/site';
import { normalizeIndianPhone, buildWhatsAppLink } from '@/lib/whatsapp';
import { LiveQueueCard } from '@/features/queue/LiveQueueCard';
import { useSendContactMessageMutation } from '@/features/contact/contactApi';
import { useAppDispatch } from '@/app/hooks';
import { addToast } from '@/features/ui/uiSlice';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:(?:\+|0{0,2})91(\s*[- ]\s*)?|[0]?)?[6789]\d{9}$/,
      'Please enter a valid 10-digit Indian mobile number'
    ),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  message: z.string().min(5, 'Message must be at least 5 characters').max(1000),
});

export default function ContactPage() {
  const dispatch = useAppDispatch();
  const [sendContactMessage, { isLoading }] = useSendContactMessageMutation();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await sendContactMessage(data).unwrap();
      setIsSubmitted(true);
      reset();
      dispatch(
        addToast({
          type: 'success',
          message: 'Message sent! Our concierge will contact you shortly.',
        })
      );
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          message: err?.message || 'Failed to deliver message. Please try again or WhatsApp us.',
        })
      );
    }
  };

  const phone = normalizeIndianPhone(siteConfig.whatsapp) || '919876543210';
  const whatsappUrl = buildWhatsAppLink(
    phone,
    `Hello ${siteConfig.name}, I would like to inquire about appointments and grooming services.`
  );

  const handleWhatsAppClick = () => {
    if (typeof window !== 'undefined' && window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: 'whatsapp_click', channel: 'contact_page' });
    } else if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'whatsapp_click', {
        event_category: 'engagement',
        event_label: 'contact_page',
      });
    }
  };

  return (
    <>
      <Seo
        title="Contact & Studio Location | Sovereign Barbershop"
        description="Connect with our concierge. Visit our studio at 100 Feet Road, Indiranagar, Bengaluru. Phone, email, WhatsApp, and studio map."
        canonical="/contact"
      />

      <PageBanner
        eyebrow="Concierge & Location"
        title="VISIT US & GET IN TOUCH"
        description="Have a question or looking to plan a wedding party grooming session? Reach out directly or drop by our Indiranagar sanctuary."
      />

      <Section tone="cream" className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left Column: Location, Hours, WhatsApp, Map */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <SectionHeading level={2} tone="dark" className="text-2xl sm:text-3xl text-ink mb-6">
                  STUDIO INFORMATION
                </SectionHeading>

                <div className="space-y-4 text-sm text-ink">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{siteConfig.location.address}</p>
                      <p className="text-muted">{siteConfig.location.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-accent shrink-0" />
                    <a
                      href={`tel:${siteConfig.phone}`}
                      className="hover:text-accent font-semibold transition-colors"
                    >
                      {siteConfig.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-accent shrink-0" />
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="hover:text-accent font-semibold transition-colors"
                    >
                      {siteConfig.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Live Queue Card */}
              <LiveQueueCard />

              {/* Operating Hours */}
              <div className="p-6 rounded-lg bg-card border border-border-light">
                <div className="flex items-center gap-2 mb-4 text-ink">
                  <Clock className="w-5 h-5 text-accent" />
                  <h3 className="font-display text-lg tracking-wide uppercase">Operating Hours</h3>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  {siteConfig.hours.map((h) => (
                    <div key={h.days} className="flex justify-between items-center text-muted">
                      <span className="font-medium">{h.days}</span>
                      <span className="text-ink font-semibold">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp Quick Link */}
              <div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsAppClick}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1EBE5D] transition-colors shadow-sm"
                >
                  <MessageSquare className="w-5 h-5" />
                  Chat on WhatsApp
                </a>
              </div>

              {/* Map View */}
              <div>
                <h3 className="font-display text-lg tracking-wide uppercase text-ink mb-3">
                  Find Us on the Map
                </h3>
                <div className="aspect-[16/10] w-full rounded-lg overflow-hidden border border-border-light shadow-sm">
                  <MapView />
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <Card tone="light" className="p-8 sm:p-10 border border-border-light shadow-md">
                <SectionHeading level={2} tone="dark" className="text-2xl sm:text-3xl text-ink mb-2">
                  SEND A MESSAGE
                </SectionHeading>
                <p className="text-muted text-sm mb-8 font-normal">
                  Fill out the form below and our concierge desk will reply within 24 business hours.
                </p>

                {isSubmitted && (
                  <div className="mb-6 p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Thank you! Your message has been received. We will get in touch shortly.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  {/* Full Name */}
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
                      Full Name <span className="text-accent">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      {...register('name')}
                      className={`w-full px-4 py-3 rounded-md bg-card border text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent ${
                        errors.name ? 'border-red-500' : 'border-border-light'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
                      Phone Number <span className="text-accent">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      {...register('phone')}
                      className={`w-full px-4 py-3 rounded-md bg-card border text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent ${
                        errors.phone ? 'border-red-500' : 'border-border-light'
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
                      Email Address <span className="text-muted text-[10px] lowercase">(optional)</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      {...register('email')}
                      className={`w-full px-4 py-3 rounded-md bg-card border text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent ${
                        errors.email ? 'border-red-500' : 'border-border-light'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
                      Your Message <span className="text-accent">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      placeholder="Tell us what you are looking for..."
                      {...register('message')}
                      className={`w-full px-4 py-3 rounded-md bg-card border text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none ${
                        errors.message ? 'border-red-500' : 'border-border-light'
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    disabled={isLoading}
                    className="w-full justify-center tracking-wider uppercase font-semibold text-sm py-3.5 mt-2"
                  >
                    {isLoading ? (
                      'Sending Message...'
                    ) : (
                      <span className="flex items-center gap-2">
                        Send Message <Send className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
