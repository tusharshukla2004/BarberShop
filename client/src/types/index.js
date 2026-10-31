/**
 * Shared JSDoc type definitions for the Barbershop client application
 *
 * @typedef {Object} Service
 * @property {string} id - Unique identifier
 * @property {string} name - Service title
 * @property {string} category - Service category ('Hair' | 'Shave' | 'Beard' | 'Combo' | 'Treatment')
 * @property {string} description - Brief summary of the service
 * @property {number} price - Cost in INR (no decimals)
 * @property {number} durationMinutes - Service duration in minutes
 * @property {boolean} isActive - Active availability flag
 *
 * @typedef {Object} BarberSocials
 * @property {string} [instagram] - Instagram profile URL
 * @property {string} [twitter] - Twitter/X profile URL
 * @property {string} [facebook] - Facebook profile URL
 *
 * @typedef {Object} Barber
 * @property {string} id - Unique identifier
 * @property {string} name - Barber full name
 * @property {string} role - Role / title (e.g., 'Master Craftsman')
 * @property {string} photoUrl - Image portrait URL
 * @property {number} experienceYears - Years of experience
 * @property {string[]} specialties - List of specializations
 * @property {BarberSocials} [socials] - Social media links
 * @property {boolean} isActive - Active availability flag
 *
 * @typedef {Object} GalleryItem
 * @property {string} id - Unique identifier
 * @property {string} imageUrl - Image asset URL
 * @property {string} category - Classification ('Haircut' | 'Shave' | 'Beard' | 'Treatment' | 'Combo')
 * @property {string} caption - Descriptive caption
 *
 * @typedef {Object} Review
 * @property {string} id - Unique identifier
 * @property {string} customerName - Client name
 * @property {number} rating - Star rating (1-5)
 * @property {string} text - Testimonial quote text
 * @property {string} [role] - Optional client title / affiliation
 *
 * @typedef {'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'} BookingStatus
 *
 * @typedef {Object} Booking
 * @property {string} id - Unique booking identifier
 * @property {string} customerName - Client full name
 * @property {string} phone - Client phone number
 * @property {string} [email] - Client email address
 * @property {string} serviceId - Selected service ID
 * @property {string} barberId - Assigned barber ID
 * @property {string} date - Date string (YYYY-MM-DD)
 * @property {string} startTime - Slot start time (e.g., '10:00 AM')
 * @property {string} endTime - Slot end time (e.g., '10:45 AM')
 * @property {BookingStatus} status - Lifecycle status
 * @property {string} [notes] - Special requests / notes
 *
 * @typedef {Object} Slot
 * @property {string} startTime - ISO or formatted start time (e.g., '09:30 AM')
 * @property {string} endTime - ISO or formatted end time (e.g., '10:15 AM')
 * @property {boolean} [isAvailable=true] - Availability flag
 *
 * @typedef {Object} Settings
 * @property {Array<{ days: string, time: string }>} shopHours - Operating schedule
 * @property {string[]} holidays - Scheduled closure dates (YYYY-MM-DD)
 * @property {number} slotLengthMinutes - Standard booking interval
 * @property {Object} policies - Booking cancellation and grace period rules
 *
 * @typedef {Object} CustomerStats
 * @property {number} totalVisits - Total appointment count
 * @property {number} completedVisits - Finished appointments count
 * @property {number} cancelledCount - Cancelled appointments count
 * @property {number} noShowCount - Missed appointments count
 * @property {string|null} lastVisitAt - ISO timestamp of latest visit
 * @property {number} totalSpent - Lifetime spend in INR
 *
 * @typedef {Object} Customer
 * @property {string} id - Unique customer ID
 * @property {string} name - Customer full name
 * @property {string} phone - Normalized 12-digit Indian mobile number (e.g. 919876543210)
 * @property {string} [email] - Customer email address
 * @property {string} [notes] - Barber notes and preferences
 * @property {string[]} [tags] - Categorization tags (e.g. 'VIP', 'Fade', 'Beard')
 * @property {string|null} [preferredBarberId] - Preferred barber ID
 * @property {string[]} [preferredServiceIds] - Preferred service IDs
 * @property {boolean} [whatsappConsent] - WhatsApp communication opt-in
 * @property {CustomerStats} stats - Aggregated visit statistics
 * @property {boolean} isFlagged - Staff review flag
 * @property {string} [flagReason] - Reason for flagging
 * @property {string} createdAt - ISO timestamp
 *
 * @typedef {Object} ApiError
 * @property {number} status - HTTP status code
 * @property {string} message - User-friendly error message
 * @property {any} [details] - Additional validation details
 *
 * @typedef {Object} AuthUser
 * @property {string} id - User ID
 * @property {string} name - Display name
 * @property {string} email - Email address
 * @property {'admin' | 'staff' | 'client'} role - Permission level
 *
 * @typedef {Object} BilingualString
 * @property {string} en - English text
 * @property {string} [hi] - Hindi text
 *
 * @typedef {'percent' | 'flat' | 'free_addon' | 'combo' | 'info'} OfferType
 *
 * @typedef {Object} Offer
 * @property {string} id - Unique identifier
 * @property {BilingualString} title - Bilingual promotional title
 * @property {BilingualString} [description] - Bilingual description
 * @property {string} [imageUrl] - Visual banner URL
 * @property {OfferType} type - Discount algorithm type
 * @property {number} value - Numeric discount amount or percent
 * @property {string[]} [appliesToServiceIds] - Service restrictions
 * @property {string} startsAt - ISO timestamp start date
 * @property {string} endsAt - ISO timestamp expiration date
 * @property {boolean} isActive - Active toggle
 * @property {boolean} showOnHome - Home page carousel toggle
 * @property {string} [promoCode] - Alphanumeric coupon code
 * @property {number|null} [usageLimit] - Total allowed redemptions
 * @property {number} [usedCount] - Realized redemptions
 * @property {number[]} [daysOfWeek] - Valid days (0=Sun, 6=Sat)
 * @property {'Live' | 'Scheduled' | 'Expired' | 'Inactive'} [statusBadge] - Lifecycle badge
 *
 * @typedef {'Booking' | 'Pricing' | 'Services' | 'Policies' | 'Other'} FaqCategory
 *
 * @typedef {Object} FAQ
 * @property {string} id - Unique identifier
 * @property {BilingualString} question - Bilingual question text
 * @property {BilingualString} answer - Bilingual answer explanation
 * @property {FaqCategory} category - Topic classification
 * @property {number} order - Visual sorting sequence
 * @property {boolean} isPublished - Public display toggle
 *
 * @typedef {'created' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partially_refunded'} PaymentStatus
 * @typedef {'deposit' | 'full' | 'balance'} PaymentPurpose
 *
 * @typedef {Object} Payment
 * @property {string} id - Unique payment record ID
 * @property {string} bookingId - Associated booking ID
 * @property {string} razorpayOrderId - Razorpay order reference
 * @property {string} [razorpayPaymentId] - Razorpay transaction identifier
 * @property {number} amount - Amount in paise (multiply by 100)
 * @property {string} [currency='INR'] - Currency code
 * @property {PaymentPurpose} purpose - Payment purpose (deposit, full, or balance)
 * @property {PaymentStatus} status - Gateway lifecycle status
 * @property {string} [method] - Payment method (upi, card, netbanking)
 * @property {number} [refundedAmount=0] - Total refunded in paise
 * @property {string} [createdAt] - Creation timestamp
 *
 * @typedef {Object} PaymentSettings
 * @property {boolean} paymentsEnabled - Online gateway enable toggle
 * @property {'none' | 'deposit' | 'full'} paymentMode - Collection mode
 * @property {'flat' | 'percent'} depositType - Calculation type
 * @property {number} depositValue - Percentage or flat amount
 * @property {number} minimumServicePrice - Threshold below which deposits are exempt
 * @property {number} refundPolicyHours - Cancellation window for full refund
 * @property {BilingualString} refundPolicyText - Bilingual policy explanation
 * @property {number} holdTimeoutMinutes - Slot hold duration
 */

export {};
