import { Injectable } from '@angular/core';

export interface ServiceItem {
  category: string;
  title: string;
  description: string;
  steps: string[];
  price: string;
}

export interface DentistItem {
  name: string;
  role: string;
  qualifications: string;
  experience: string;
  philosophy: string;
  image: string;
}

export interface ReviewItem {
  name: string;
  quote: string;
  service: string;
}

export interface PricingItem {
  service: string;
  price: string;
}

export interface GalleryItem {
  title: string;
  label: string;
  image: string;
}

export interface BlogItem {
  title: string;
  excerpt: string;
  tag: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

@Injectable({ providedIn: 'root' })
export class SiteDataService {
  readonly clinicName = 'DentaCare Dental';
  readonly city = 'Johannesburg';
  readonly tagline = 'Gentle, modern dentistry in Johannesburg';
  readonly intro = 'Convenient dental care with online booking, transparent service information, and a friendly team focused on comfort and long-term oral health.';

  readonly featuredServices = [
    'Same-day checkups',
    'Teeth cleaning',
    'Whitening',
    'Emergency dental care'
  ];

  readonly dentists: DentistItem[] = [
    {
      name: 'Dr. Maya Vale',
      role: 'Family & Cosmetic Dentist',
      qualifications: 'BDS · Family Dentistry',
      experience: '12+ years of family and cosmetic dentistry experience',
      philosophy: 'Focused on gentle care, clear explanations, and treatment plans that help patients feel comfortable and informed.',
      image: 'https://images.unsplash.com/photo-1612277795421-9bc7706a4a41?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Dr. Theo Lane',
      role: 'Restorative Dentist',
      qualifications: 'BChD · Restorative Dentistry',
      experience: '10+ years of restorative and rehabilitation experience',
      philosophy: 'Combines modern restorative workflows with practical treatment planning and patient-friendly communication.',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Dr. Zuri Hart',
      role: 'Orthodontic & Preventive Dentist',
      qualifications: 'BDS · Preventive Dentistry',
      experience: '9+ years of alignment and preventive-care experience',
      philosophy: 'Passionate about preventive habits, alignment planning, and helping patients understand every step of their care.',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=80'
    }
  ];

  readonly services: ServiceItem[] = [
    {
      category: 'General Dentistry',
      title: 'Checkups & Preventive Care',
      description: 'Routine examinations, digital diagnostics, and gentle cleanings to help keep teeth and gums healthy year-round.',
      steps: ['Consultation and oral exam', 'Cleaning and plaque removal', 'Personalised prevention plan'],
      price: 'From R750'
    },
    {
      category: 'General Dentistry',
      title: 'Fillings & Root Canal Care',
      description: 'Comfort-focused treatment for tooth decay and infection using modern techniques designed to preserve the natural tooth.',
      steps: ['Assessment and X-rays', 'Treatment planning', 'Restoration and aftercare'],
      price: 'From R950'
    },
    {
      category: 'Cosmetic Dentistry',
      title: 'Teeth Whitening & Veneers',
      description: 'Whitening and veneer options designed to improve the appearance of a smile while protecting long-term oral health.',
      steps: ['Smile consultation', 'Shade and design planning', 'Treatment and review'],
      price: 'From R2 500'
    },
    {
      category: 'Restorative Dentistry',
      title: 'Crowns, Bridges & Implants',
      description: 'Restore function and confidence with durable treatment options designed for a natural-looking result.',
      steps: ['Clinical assessment', 'Digital impressions', 'Placement and follow-up'],
      price: 'Quote on consultation'
    },
    {
      category: 'Orthodontics',
      title: 'Braces & Clear Aligners',
      description: 'Alignment options for teenagers and adults, supported by structured treatment planning and regular progress reviews.',
      steps: ['Orthodontic assessment', 'Custom treatment plan', 'Progress reviews'],
      price: 'From R1 250 / consult'
    },
    {
      category: 'Emergency Dental Care',
      title: 'Urgent Dental Relief',
      description: 'Fast support for severe toothache, swelling, chipped teeth, and other urgent dental concerns.',
      steps: ['Emergency triage', 'Pain relief and stabilisation', 'Next-step treatment plan'],
      price: 'Call for urgent availability'
    }
  ];

  readonly reviews: ReviewItem[] = [
    {
      name: 'Jamie T.',
      quote: 'The booking process was quick and the team explained every step clearly. The whole visit felt calm and organised.',
      service: 'Family dentistry'
    },
    {
      name: 'Jordan K.',
      quote: 'I appreciated the clear options and pricing before treatment. Everything felt easy to understand from the start.',
      service: 'Cosmetic dentistry'
    },
    {
      name: 'Casey M.',
      quote: 'I needed an urgent appointment and the experience was straightforward from booking through to follow-up.',
      service: 'Emergency care'
    }
  ];

  readonly pricing: PricingItem[] = [
    { service: 'Dental cleaning', price: 'R750' },
    { service: 'White filling', price: 'R950' },
    { service: 'Emergency consultation', price: 'R850' },
    { service: 'Teeth whitening', price: 'R2 500' },
    { service: 'Orthodontic consultation', price: 'R1 250' }
  ];

  readonly medicalAids = ['Major medical aids', 'Claim assistance', 'Private payment'];
  readonly paymentOptions = ['Cash', 'Card', 'EFT', 'Medical aid claims'];

  readonly gallery: GalleryItem[] = [
    {
      title: 'Whitening refresh',
      label: 'Whitening treatment journey',
      image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Smile makeover',
      label: 'Veneers consultation journey',
      image: 'https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Healthy alignment',
      label: 'Orthodontic treatment journey',
      image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  readonly articles: BlogItem[] = [
    {
      tag: 'Dental Education',
      title: 'How to prevent cavities between appointments',
      excerpt: 'Simple daily habits, smart brushing, and when to book your next professional cleaning.'
    },
    {
      tag: 'Orthodontics',
      title: 'When should children get braces assessed?',
      excerpt: 'A practical overview of orthodontic assessments and early signs parents can watch for.'
    },
    {
      tag: 'Cosmetic Care',
      title: 'Teeth whitening tips that protect enamel',
      excerpt: 'Understand the common whitening options and what to consider before starting treatment.'
    }
  ];

  readonly faqs: FaqItem[] = [
    {
      question: 'Does teeth whitening hurt?',
      answer: 'Most people experience little to no discomfort. Sensitivity can be assessed before treatment so the right option can be selected.'
    },
    {
      question: 'How often should I visit the dentist?',
      answer: 'A checkup every six months is common, although appointment frequency should be based on individual oral-health needs.'
    },
    {
      question: 'Do you accept medical aid?',
      answer: 'The booking flow supports medical-aid and private-payment scenarios, with claim details discussed during the appointment process.'
    },
    {
      question: 'Can I book an emergency appointment?',
      answer: 'Yes. Urgent requests can be captured through the booking flow and prioritised based on availability.'
    }
  ];

  readonly formLinks = ['New patient form', 'Medical history form', 'Consent form'];

  readonly contact = {
    address: '100 Willow Lane, Rosebank, Johannesburg',
    phone: '010 000 0000',
    emergencyPhone: '010 000 0001',
    email: 'hello@dentacare.example',
    hours: 'Mon–Fri 08:00–17:00 · Sat 09:00–13:00'
  };
}
