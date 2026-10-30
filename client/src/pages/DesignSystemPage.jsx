import { useState } from 'react';
import {
  Container,
  Section,
  SectionHeading,
  Button,
  Input,
  IconButton,
  Card,
} from '@/components/ui';
import { siteConfig } from '@/config/site';
import {
  Scissors,
  Calendar,
  Clock,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

/**
 * Temporary Design System Verification Showcase (/design-system)
 * Inspects all tokens, typography, primitives, and responsive behaviors.
 * @returns {JSX.Element}
 */
export function DesignSystemPage() {
  const [inputValue, setInputValue] = useState('');
  const [loadingBtn, setLoadingBtn] = useState(false);

  return (
    <div className="min-h-screen bg-white text-ink pb-20">
      {/* Top Banner */}
      <header className="border-b border-border-light bg-card py-6">
        <Container className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Design Verification
            </span>
            <h1 className="font-display text-4xl text-ink">{siteConfig.name} Design System</h1>
            <p className="text-sm text-muted mt-1">
              Live token inspection, interactive primitives, and responsive audit.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" rightIcon={<Calendar className="h-4 w-4" />} to="/">
              Back to Home
            </Button>
          </div>
        </Container>
      </header>

      {/* 1. Color Palette Tokens */}
      <Section tone="white" py="sm">
        <Container>
          <SectionHeading
            subtitle="Core Design Tokens"
            title="Color Palette"
            align="left"
            className="mb-8"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            <div className="flex flex-col gap-2">
              <div className="h-20 w-full rounded-md bg-ink shadow-sm border border-border-light" />
              <div className="text-xs font-semibold text-ink">Ink</div>
              <div className="text-[11px] text-muted font-mono">var(--color-ink)</div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-20 w-full rounded-md bg-brown shadow-sm" />
              <div className="text-xs font-semibold text-ink">Brown</div>
              <div className="text-[11px] text-muted font-mono">var(--color-brown)</div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-20 w-full rounded-md bg-cream shadow-sm border border-border-light" />
              <div className="text-xs font-semibold text-ink">Cream</div>
              <div className="text-[11px] text-muted font-mono">var(--color-cream)</div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-20 w-full rounded-md bg-accent shadow-sm" />
              <div className="text-xs font-semibold text-ink">Accent</div>
              <div className="text-[11px] text-muted font-mono">var(--color-accent)</div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-20 w-full rounded-md bg-card shadow-sm border border-card-border" />
              <div className="text-xs font-semibold text-ink">Card Surface</div>
              <div className="text-[11px] text-muted font-mono">var(--color-card)</div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-20 w-full rounded-md bg-white shadow-sm border border-border-light" />
              <div className="text-xs font-semibold text-ink">White</div>
              <div className="text-[11px] text-muted font-mono">var(--color-white)</div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-20 w-full rounded-md bg-muted shadow-sm" />
              <div className="text-xs font-semibold text-ink">Muted</div>
              <div className="text-[11px] text-muted font-mono">var(--color-muted)</div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-20 w-full rounded-md bg-ink p-2 flex items-center justify-center">
                <span className="text-[11px] text-on-dark-muted font-mono text-center">
                  On-Dark Muted
                </span>
              </div>
              <div className="text-xs font-semibold text-ink">On Dark Muted</div>
              <div className="text-[11px] text-muted font-mono">var(--color-on-dark-muted)</div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 2. Typography Hierarchy */}
      <Section tone="cream" py="sm">
        <Container>
          <SectionHeading
            subtitle="Hierarchy & Scale"
            title="Typography Hierarchy"
            align="left"
            className="mb-8"
          />

          <div className="space-y-6">
            <div className="border-b border-border-light pb-4">
              <span className="text-xs text-muted uppercase font-mono">
                Display H1 (Bebas Neue)
              </span>
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-ink mt-1">
                Precision Cuts & Hot Towel Shaves
              </h1>
            </div>

            <div className="border-b border-border-light pb-4">
              <span className="text-xs text-muted uppercase font-mono">
                Display H2 (Bebas Neue)
              </span>
              <h2 className="font-display text-4xl sm:text-5xl text-ink mt-1">
                Master Barbers & Heritage Grooming
              </h2>
            </div>

            <div className="border-b border-border-light pb-4">
              <span className="text-xs text-muted uppercase font-mono">
                Display H3 (Bebas Neue)
              </span>
              <h3 className="font-display text-3xl sm:text-4xl text-ink mt-1">
                Signature Beard Sculpting & Styling
              </h3>
            </div>

            <div>
              <span className="text-xs text-muted uppercase font-mono">Body Font (Inter)</span>
              <p className="font-body text-base sm:text-lg text-ink/80 mt-2 max-w-2xl leading-relaxed">
                Step into an ambiance crafted with heritage aesthetics, artisanal mastery, and
                genuine comfort. Every cut is tailored with surgical precision, elevating your daily
                confidence.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* 3. Section Tones Demonstration */}
      <div className="space-y-1">
        <Section tone="dark" py="sm">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <SectionHeading
                subtitle="Tone = 'dark'"
                title="Dark Section (Ink Background)"
                align="left"
                tone="dark"
              />
              <Button variant="primary" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
                Dark Tone Action
              </Button>
            </div>
          </Container>
        </Section>

        <Section tone="brown" py="sm">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <SectionHeading
                subtitle="Tone = 'brown'"
                title="Brown Section (Location/Service Background)"
                align="left"
                tone="dark"
              />
              <Button variant="primary" size="sm" rightIcon={<Clock className="h-4 w-4" />}>
                View Hours
              </Button>
            </div>
          </Container>
        </Section>

        <Section tone="cream" py="sm">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <SectionHeading
                subtitle="Tone = 'cream'"
                title="Cream Section (Works & Testimonials Background)"
                align="left"
                tone="light"
              />
              <Button variant="secondary" size="sm">
                Secondary Button
              </Button>
            </div>
          </Container>
        </Section>

        <Section tone="white" py="sm">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <SectionHeading
                subtitle="Tone = 'white'"
                title="White Section (Team & Content Background)"
                align="left"
                tone="light"
              />
              <Button variant="ghost" size="sm">
                Ghost Action
              </Button>
            </div>
          </Container>
        </Section>
      </div>

      {/* 4. Interactive Primitives: Buttons & Icon Buttons */}
      <Section tone="white" py="sm">
        <Container>
          <SectionHeading
            subtitle="Components / UI"
            title="Buttons & Interactive Controls"
            align="left"
            className="mb-8"
          />

          <div className="space-y-8">
            {/* Sizes */}
            <div>
              <h4 className="text-xs uppercase font-mono text-muted mb-3">Button Sizes</h4>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm" variant="primary">
                  Small Button
                </Button>
                <Button size="md" variant="primary">
                  Medium Button
                </Button>
                <Button size="lg" variant="primary">
                  Large Button
                </Button>
              </div>
            </div>

            {/* Variants */}
            <div>
              <h4 className="text-xs uppercase font-mono text-muted mb-3">
                Button Variants & States
              </h4>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" rightIcon={<Scissors className="h-4 w-4" />}>
                  Primary with Icon
                </Button>
                <Button variant="secondary" leftIcon={<Calendar className="h-4 w-4" />}>
                  Secondary Action
                </Button>
                <Button variant="ghost" rightIcon={<ChevronRight className="h-4 w-4" />}>
                  Ghost Link
                </Button>
                <Button
                  variant="primary"
                  isLoading={loadingBtn}
                  onClick={() => {
                    setLoadingBtn(true);
                    setTimeout(() => setLoadingBtn(false), 1500);
                  }}
                >
                  Click For Loading State
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            {/* Icon Buttons */}
            <div>
              <h4 className="text-xs uppercase font-mono text-muted mb-3">
                Icon Buttons (Mandatory aria-label)
              </h4>
              <div className="flex flex-wrap items-center gap-4">
                <IconButton aria-label="Scissors action" variant="primary" size="md">
                  <Scissors className="h-4 w-4" />
                </IconButton>
                <IconButton aria-label="Book appointment" variant="secondary" size="md">
                  <Calendar className="h-4 w-4" />
                </IconButton>
                <IconButton aria-label="Shop contact phone" variant="outline" size="md">
                  <Phone className="h-4 w-4" />
                </IconButton>
                <IconButton aria-label="Email support" variant="ghost" size="md">
                  <Mail className="h-4 w-4" />
                </IconButton>
                <IconButton aria-label="Disabled icon action" variant="outline" size="md" disabled>
                  <Sparkles className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 5. Form Inputs */}
      <Section tone="cream" py="sm">
        <Container>
          <SectionHeading
            subtitle="Components / UI"
            title="Form Inputs (Light & Dark Tones)"
            align="left"
            className="mb-8"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Light Inputs */}
            <Card tone="white" padding="md" className="space-y-4">
              <h4 className="font-display text-xl text-ink">Light Context Inputs</h4>
              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                required
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="Enter your name as it appears on your booking"
              />
              <Input label="Phone Number" type="tel" placeholder="+91 98765 43210" required />
              <Input
                label="Invalid Example"
                defaultValue="invalid-email@"
                error="Please provide a valid email address."
              />
              <Input label="Disabled Field" disabled defaultValue="Pre-filled value" />
            </Card>

            {/* Dark Inputs */}
            <Card tone="dark" padding="md" className="space-y-4">
              <h4 className="font-display text-xl text-white">Dark Context Inputs</h4>
              <Input
                tone="dark"
                label="Full Name"
                placeholder="e.g. John Doe"
                required
                helperText="Used inside hero booking cards and dark sections"
              />
              <Input
                tone="dark"
                label="Preferred Service"
                placeholder="Classic Beard Trim"
                required
              />
              <Input
                tone="dark"
                label="Appointment Date"
                error="This time slot is no longer available."
              />
              <Input
                tone="dark"
                label="Disabled Field"
                disabled
                defaultValue="Unchangeable setting"
              />
            </Card>
          </div>
        </Container>
      </Section>

      {/* 6. Cards & Containers */}
      <Section tone="white" py="sm">
        <Container>
          <SectionHeading
            subtitle="Components / UI"
            title="Card Surfaces"
            align="left"
            className="mb-8"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card tone="card" padding="md">
              <div className="flex items-center gap-2 text-accent mb-2">
                <Scissors className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Card Tone</span>
              </div>
              <h4 className="font-display text-2xl text-ink">Haircut & Styling</h4>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                Consultation, precision razor fade, hot lather neck shave, and bespoke finish.
              </p>
              <div className="mt-4 pt-4 border-t border-card-border flex items-center justify-between">
                <span className="font-display text-xl text-ink">₹850</span>
                <span className="text-xs text-muted">45 mins</span>
              </div>
            </Card>

            <Card tone="cream" padding="md">
              <div className="flex items-center gap-2 text-accent mb-2">
                <Sparkles className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Cream Tone</span>
              </div>
              <h4 className="font-display text-2xl text-ink">Hot Towel Shave</h4>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                Essential oils prep, dual hot towel wraps, rich lather straight razor shave.
              </p>
              <div className="mt-4 pt-4 border-t border-border-light flex items-center justify-between">
                <span className="font-display text-xl text-ink">₹650</span>
                <span className="text-xs text-muted">35 mins</span>
              </div>
            </Card>

            <Card tone="brown" padding="md">
              <div className="flex items-center gap-2 text-accent mb-2">
                <MapPin className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Brown Tone</span>
              </div>
              <h4 className="font-display text-2xl text-white">Our Location</h4>
              <p className="text-xs text-on-dark-muted mt-2 leading-relaxed">
                {siteConfig.address}
              </p>
              <div className="mt-4 pt-4 border-t border-border-dark flex items-center justify-between text-xs text-accent">
                <span>View On Map</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Card>

            <Card tone="dark" padding="md">
              <div className="flex items-center gap-2 text-accent mb-2">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Dark Tone</span>
              </div>
              <h4 className="font-display text-2xl text-white">VIP Membership</h4>
              <p className="text-xs text-on-dark-muted mt-2 leading-relaxed">
                Unlimited cuts, complimentary refreshments, and priority bookings.
              </p>
              <div className="mt-4 pt-4 border-t border-border-dark flex items-center justify-between">
                <span className="font-display text-xl text-accent">₹3,500/mo</span>
                <Check className="h-4 w-4 text-accent" />
              </div>
            </Card>
          </div>
        </Container>
      </Section>
    </div>
  );
}

export default DesignSystemPage;
