import { useState, useMemo, useId } from 'react';
import { Search, ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { Container, Card } from '@/components/ui';
import { Seo } from '@/components/common/Seo';
import { useGetPublicFaqsQuery } from '@/features/faqs/faqsApi';
import { siteConfig } from '@/config/site';
import { normalizeIndianPhone, buildWhatsAppLink } from '@/lib/whatsapp';

const CATEGORIES = ['All', 'Booking', 'Pricing', 'Services', 'Policies', 'Other'];

export default function FaqPage() {
  const { data, isLoading, isError } = useGetPublicFaqsQuery();
  const searchInputId = useId();

  const faqs = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.faqs && Array.isArray(data.faqs)) return data.faqs;
    return [];
  }, [data]);

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState(new Set());

  const toggleAccordion = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter FAQs based on active category and search text
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === 'All' || faq.category === activeCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const questionEn = (faq.question?.en || '').toLowerCase();
      const answerEn = (faq.answer?.en || '').toLowerCase();

      return (
        questionEn.includes(q) ||
        answerEn.includes(q)
      );
    });
  }, [faqs, activeCategory, searchQuery]);

  // Group filtered results by category for clean visual sections
  const groupedFaqs = useMemo(() => {
    const groups = {};
    for (const faq of filteredFaqs) {
      const cat = faq.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(faq);
    }
    return groups;
  }, [filteredFaqs]);

  // JSON-LD FAQPage Schema for Rich Search Snippets
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question?.en || '',
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer?.en || '',
      },
    })),
  };

  const whatsappPhone = normalizeIndianPhone(siteConfig.whatsapp) || '919876543210';
  const whatsappUrl = buildWhatsAppLink(
    whatsappPhone,
    `Hello ${siteConfig.name}, I have a question regarding your services and appointments.`
  );

  return (
    <>
      <Seo
        title="Frequently Asked Questions (FAQ)"
        description="Find answers to common questions about reservations, walk-in queues, services, hygiene standards, and pricing at Modern Mane Barbershop."
        canonical="/faq"
        includeSchema
        schema={faqSchema}
      />

      <section className="py-12 md:py-20 bg-neutral-50/50">
        <Container>
          {/* Header */}
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-accent/10 text-accent mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              Help & Assistance
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-wider text-ink">
              Frequently Asked Questions
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted">
              Everything you need to know about our grooming philosophy, booking etiquette, and walk-in queue.
            </p>

            {/* Search Input */}
            <div className="mt-8 max-w-lg mx-auto relative">
              <label htmlFor={searchInputId} className="sr-only">Search questions</label>
              <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id={searchInputId}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions or keywords (e.g. walk-in, payment, cancel)..."
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-border-light text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent shadow-sm"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-white border border-border-light text-muted hover:text-ink hover:border-neutral-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="max-w-3xl mx-auto space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse h-16 rounded-lg bg-neutral-200/70" />
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="max-w-md mx-auto text-center py-12">
              <p className="text-sm text-red-600 mb-4">Could not load FAQs at this time.</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-xs uppercase font-semibold text-accent underline"
              >
                Reload page
              </button>
            </div>
          )}

          {/* Empty Search Results */}
          {!isLoading && !isError && filteredFaqs.length === 0 && (
            <div className="max-w-md mx-auto text-center py-16">
              <HelpCircle className="w-10 h-10 text-muted mx-auto mb-3" />
              <p className="text-sm font-semibold text-ink">No questions found</p>
              <p className="text-xs text-muted mt-1 mb-6">
                We couldn&apos;t find any questions matching &quot;{searchQuery}&quot;. Try adjusting your search query or chat directly with our team.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#1EBE5D] transition-colors"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                Ask Us on WhatsApp
              </a>
            </div>
          )}

          {/* Accordion List */}
          {!isLoading && !isError && filteredFaqs.length > 0 && (
            <div className="max-w-3xl mx-auto space-y-8">
              {Object.entries(groupedFaqs).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <h2 className="font-display text-lg tracking-wider uppercase text-accent border-b border-border-light pb-2">
                    {category}
                  </h2>

                  <div className="space-y-3">
                    {items.map((faq) => {
                      const id = faq.id || faq._id;
                      const isOpen = openIds.has(id);
                      const contentId = `faq-content-${id}`;
                      const buttonId = `faq-btn-${id}`;

                      return (
                        <Card
                          key={id}
                          tone="light"
                          className="border border-border-light shadow-sm overflow-hidden transition-colors"
                        >
                          <button
                            id={buttonId}
                            type="button"
                            onClick={() => toggleAccordion(id)}
                            aria-expanded={isOpen}
                            aria-controls={contentId}
                            className="w-full p-4 sm:p-5 flex items-start justify-between text-left gap-4 cursor-pointer hover:bg-neutral-50/70 transition-colors"
                          >
                            <div>
                              <span className="font-semibold text-sm sm:text-base text-ink block">
                                {faq.question?.en}
                              </span>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-accent shrink-0 mt-0.5 transition-transform duration-200 ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {isOpen && (
                            <div
                              id={contentId}
                              role="region"
                              aria-labelledby={buttonId}
                              className="px-4 sm:px-5 pb-5 pt-1 border-t border-border-light/60 bg-white"
                            >
                              <p className="text-xs sm:text-sm text-ink/80 leading-relaxed">
                                {faq.answer?.en}
                              </p>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Need help footer CTA */}
          <div className="mt-16 max-w-xl mx-auto text-center p-6 sm:p-8 rounded-2xl bg-white border border-border-light shadow-sm">
            <h3 className="font-display text-xl uppercase tracking-wider text-ink mb-1">
              Still Have Questions?
            </h3>
            <p className="text-xs text-muted mb-5">
              Can&apos;t find the answer you&apos;re looking for? Reach out to our front desk directly on WhatsApp.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:scale-105"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              Chat on WhatsApp
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}

