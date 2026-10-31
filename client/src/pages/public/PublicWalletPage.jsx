import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Crown,
  Package as PackageIcon,
  Check,
  Scissors,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { useGetPublicWalletQuery } from '@/features/wallet/walletApi';
import { buildWhatsAppLink } from '@/lib/whatsapp';

export default function PublicWalletPage() {
  const { token } = useParams();
  const { data: wallet, isLoading, isError } = useGetPublicWalletQuery(token);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 bg-surface">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-muted font-mono">
            Loading Your Studio Pass...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !wallet) {
    return (
      <Container className="py-16">
        <Card className="max-w-md mx-auto p-8 text-center space-y-4 border-red-200 bg-red-50/30">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold font-serif text-ink">Digital Pass Not Found</h1>
          <p className="text-xs text-muted leading-relaxed">
            This digital pass link is either invalid, expired, or has been revoked by studio staff for your security.
          </p>
          <div className="pt-2">
            <Link to="/book">
              <Button size="sm" variant="accent">
                Book an Appointment
              </Button>
            </Link>
          </div>
        </Card>
      </Container>
    );
  }

  const { customerName, packages = [], membership, loyalty = {}, shop = {} } = wallet;
  const stampsForReward = loyalty.stampsForReward || 10;
  const currentStamps = loyalty.balance || 0;
  const isRewardReady = currentStamps >= stampsForReward;

  const studioWhatsAppLink = buildWhatsAppLink(
    shop.phone || '919876543210',
    `Namaste Modern Mane! I am viewing my digital wallet pass and would like to book a slot.`
  );

  return (
    <div className="min-h-screen bg-sand/20 py-10">
      <Container>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header Pass Card */}
          <div className="rounded-2xl p-6 sm:p-8 bg-ink text-sand border border-accent/30 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-40 h-40 bg-accent/15 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-accent font-bold block mb-1">
                  Modern Mane Barber Studio · Member Pass
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
                  Namaste, {customerName}!
                </h1>
                <p className="text-xs text-sand/70 mt-1">
                  Your live prepaid haircut packages, VIP status & loyalty stamps.
                </p>
              </div>

              {membership ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-950 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Crown className="w-3.5 h-3.5" /> VIP Member
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-sand border border-white/20 uppercase tracking-wider">
                  Club Pass
                </span>
              )}
            </div>

            {/* Loyalty Stamp Card */}
            {loyalty.enabled !== false && (
              <div className="pt-6 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Visit Stamp Card ({currentStamps} of {stampsForReward} stamps)
                  </span>
                  {isRewardReady && (
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider animate-pulse">
                      ★ Free Haircut Ready!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {Array.from({ length: stampsForReward }).map((_, idx) => {
                    const isEarned = idx < currentStamps;
                    return (
                      <div
                        key={idx}
                        className={`h-11 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                          isEarned
                            ? 'bg-accent text-ink shadow-md scale-100 border border-amber-300'
                            : 'bg-white/5 border border-dashed border-white/20 text-white/40'
                        }`}
                      >
                        {isEarned ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                      </div>
                    );
                  })}
                </div>

                {isRewardReady ? (
                  <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs">
                    🎉 You have completed {stampsForReward} visits! Inform your master barber at your next appointment to redeem your complimentary cut.
                  </div>
                ) : (
                  <p className="text-[11px] text-sand/60">
                    Collect {stampsForReward - (currentStamps % stampsForReward)} more visit stamps to claim your next complimentary grooming session.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Prepaid Packages Card */}
          <Card className="p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink mb-4 flex items-center gap-2">
              <PackageIcon className="w-4 h-4 text-primary" />
              Prepaid Haircut Sessions
            </h2>

            {packages.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted rounded-lg bg-surface/50 border border-border-light">
                You do not have any active prepaid packages. Inquire with your barber on your next visit to save with bundled sessions.
              </div>
            ) : (
              <div className="space-y-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-4 rounded-xl border border-border-light bg-surface/50 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-ink text-sm">{pkg.name?.en || 'Package'}</h3>
                        <span className="text-[11px] text-muted block mt-0.5 font-mono">
                          Expires: {new Date(pkg.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                        {pkg.sessionsRemaining} sessions left
                      </span>
                    </div>

                    <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(((pkg.sessionsRemaining || 0) / (pkg.sessionsTotal || 1)) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* VIP Membership Card if applicable */}
          {membership && (
            <Card className="p-6 border-amber-300 bg-amber-50/30">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-200 text-amber-900">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-ink font-serif">
                      {membership.name?.en || 'VIP Membership Club'}
                    </h2>
                    <span className="text-xs text-muted block">
                      Valid through {new Date(membership.endsAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 uppercase">
                  Active
                </span>
              </div>

              <div className="pt-2 border-t border-amber-200 space-y-1.5 text-xs text-amber-950 font-medium">
                {Array.isArray(membership.benefits) &&
                  membership.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>
                        {b.type === 'discount_percent' && `${b.value}% discount applied to all bookings`}
                        {b.type === 'free_service' && 'Complimentary grooming service included'}
                        {b.type === 'priority_booking' && 'VIP priority booking queue privileges'}
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Quick Studio Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to="/book" className="flex-1">
              <Button size="lg" className="w-full justify-center text-xs uppercase tracking-wider font-semibold">
                <Scissors className="w-4 h-4 mr-2" /> Book New Appointment
              </Button>
            </Link>

            {studioWhatsAppLink && (
              <a
                href={studioWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full justify-center text-xs uppercase tracking-wider font-semibold bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border-[#25D366]/40"
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> Message Studio
                </Button>
              </a>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

