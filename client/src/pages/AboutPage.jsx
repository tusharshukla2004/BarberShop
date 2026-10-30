import { useState } from 'react';
import { ChevronDown, ShieldCheck, Clock, Award, Sparkles } from 'lucide-react';
import Seo from '@/components/common/Seo';
import PageBanner from '@/components/common/PageBanner';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import { assets } from '@/assets';

const shopStory = {
  headline: 'THE ART OF BESPOKE GROOMING REIMAGINED',
  paragraphs: [
    'Founded in 2018 in the cultural heart of Indiranagar, Sovereign was built upon a solitary commitment: resurrecting the deliberate, unhurried craftsmanship of traditional gentleman barbering while embracing modern aesthetic precision.',
    'We believe a haircut or shave is far more than routine upkeep—it is a restorative ritual. From our hand-restored Japanese Takara Belmont chairs to our custom-formulated sandalwood and eucalyptus tonics, every touchpoint in our studio was designed as a sanctuary away from the city hustle.',
    'Our craftsmen undergo rigorous classical apprentice training, mastering scissors-over-comb architecture, hot-lather razor glides, and anatomical beard contouring. Here, tradition meets contemporary elegance.',
  ],
  teamPhotoUrl: assets.aboutTeam,
};

const shopValues = [
  {
    icon: Award,
    title: 'UNCOMPROMISED MASTERY',
    description:
      'We measure our cuts in millimeters and our shaves in layers of warm lather. No shortcuts, no rushed appointments.',
  },
  {
    icon: Sparkles,
    title: 'THE BESPOKE CONSULTATION',
    description:
      'Every appointment begins with an in-depth dialogue about your facial structure, hair texture, and personal lifestyle.',
  },
  {
    icon: ShieldCheck,
    title: 'AUTHENTIC SANCTUARY',
    description:
      'A relaxed environment featuring single-origin espresso, warm botanical towels, and vintage vinyl acoustics.',
  },
  {
    icon: Clock,
    title: 'REVERENCE FOR TIME',
    description:
      'We respect your schedule with seamless online reservations, guaranteed chair times, and punctual execution.',
  },
];

const shopPolicies = [
  {
    title: 'CANCELLATION & RESCHEDULING',
    description:
      'We understand schedules change. We kindly request at least 2 hours notice prior to your appointment time to cancel or reschedule without any fee.',
  },
  {
    title: 'GRACE PERIOD & LATE ARRIVALS',
    description:
      'We provide a 10-minute grace period. If you arrive beyond 10 minutes past your scheduled slot, we may adjust the service scope to ensure subsequent clients are not delayed.',
  },
  {
    title: 'NO-SHOW POLICY',
    description:
      'Clients who fail to attend without notice forfeit their reserved chair. Repeated no-shows may require advance deposit for future reservations.',
  },
];

const faqs = [
  {
    question: 'How far in advance should I book my appointment?',
    answer:
      'We recommend booking 2 to 3 days in advance for weekday appointments and 5 to 7 days in advance for weekend peak hours with Master Barber Devraj.',
  },
  {
    question: 'What is included with a traditional hot towel shave?',
    answer:
      'Our straight razor shave includes pre-shave botanical oils, two steamed hot towel wraps with essential oils, rich lather whipped from sandalwood soap, a surgical-grade straight razor shave, and a cold compress with aftershave balm.',
  },
  {
    question: 'Do you accept walk-ins?',
    answer:
      'While we prioritize online appointments to respect our scheduled clients, we accommodate walk-ins whenever an opening occurs. We strongly advise booking online to guarantee your preferred barber and time.',
  },
  {
    question: 'Can I purchase grooming products at the shop?',
    answer:
      'Yes, we curate an exclusive range of organic pomades, beard balms, matte styling pastes, and safety razors available for purchase at our concierge counter.',
  },
  {
    question: 'Is parking available at the location?',
    answer:
      'Yes, dedicated valet parking is complimentary for all our guests directly at our 100ft Road studio entrance.',
  },
];

export default function AboutPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <>
      <Seo
        title="Our Heritage & Story | Sovereign Barbershop"
        description="Learn about Sovereign Barbershop's craftsmanship, founding heritage, master barbers, shop values, and customer policies."
        canonical="/about"
      />

      <PageBanner
        eyebrow="Our Ethos & Origin"
        title="WHERE TRADITION MEETS PRECISION"
        description="A sanctuary crafted for the modern gentleman who values heritage scissor craft, genuine hospitality, and uncompromising standards."
      />

      {/* Story Section */}
      <Section tone="cream" className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <SectionHeading level={2} tone="dark" className="text-3xl sm:text-4xl text-ink mb-6">
                {shopStory.headline}
              </SectionHeading>
              <div className="space-y-4 text-muted text-sm sm:text-base leading-relaxed">
                {shopStory.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl border-4 border-card">
                <img
                  src={shopStory.teamPhotoUrl}
                  alt="Sovereign Barbershop interior and team craftsmanship"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-4 sm:-bottom-8 sm:-right-8 bg-ink p-6 rounded-lg shadow-xl text-white max-w-xs border border-border-dark hidden sm:block">
                <p className="font-display text-2xl text-accent">EST. 2018</p>
                <p className="text-xs text-on-dark-muted mt-1">
                  Over 15,000 bespoke cuts & shaves delivered in Indiranagar.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Values Section */}
      <Section tone="white" className="py-16 md:py-24">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
              Our Pillars
            </p>
            <SectionHeading level={2} tone="dark" className="text-3xl sm:text-4xl text-ink">
              WHAT WE STAND FOR
            </SectionHeading>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {shopValues.map((val) => {
              const Icon = val.icon;
              return (
                <Card
                  key={val.title}
                  tone="light"
                  className="p-6 border border-border-light flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300"
                >
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-xl text-ink tracking-wide mb-2">
                      {val.title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">{val.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Policies Section */}
      <Section tone="brown" className="py-16 md:py-24 text-white">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
              Transparency
            </p>
            <SectionHeading level={2} tone="light" className="text-3xl sm:text-4xl text-white">
              STORE POLICIES & COURTESY
            </SectionHeading>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shopPolicies.map((pol) => (
              <div
                key={pol.title}
                className="p-6 rounded-lg bg-ink/40 border border-border-dark backdrop-blur-sm"
              >
                <h3 className="font-display text-xl text-accent tracking-wide mb-3">
                  {pol.title}
                </h3>
                <p className="text-on-dark-muted text-sm leading-relaxed">{pol.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* FAQ Accordion Section */}
      <Section tone="cream" className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
              Common Inquiries
            </p>
            <SectionHeading level={2} tone="dark" className="text-3xl sm:text-4xl text-ink">
              FREQUENTLY ASKED QUESTIONS
            </SectionHeading>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.question}
                  className="rounded-lg bg-card border border-border-light overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span className="font-semibold text-ink text-sm sm:text-base pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-accent shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-label={faq.question}
                      className="px-6 pb-6 text-muted text-sm leading-relaxed border-t border-border-light/50 pt-4"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </Section>
    </>
  );
}
