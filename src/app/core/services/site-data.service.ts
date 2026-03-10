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
  readonly clinicName = 'SmileCraft Dental';
  readonly city = 'Johannesburg';
  readonly tagline = 'Gentle family dentistry in Johannesburg';
  readonly intro = 'Trusted dental care with easy booking, transparent pricing, and a friendly team focused on comfort and long-term oral health.';

  readonly featuredServices = [
    'Same-day checkups',
    'Teeth cleaning',
    'Whitening',
    'Emergency dental care'
  ];

  readonly dentists: DentistItem[] = [
    {
      name: 'Dr. John Smith',
      role: 'Lead Family & Cosmetic Dentist',
      qualifications: 'BDS, University of Pretoria',
      experience: '15+ years experience in cosmetic and family dentistry',
      philosophy: 'Known for gentle care, clear communication, and treatment plans that prioritise comfort and long-term oral health.',
      image: 'https://images.unsplash.com/photo-1612277795421-9bc7706a4a41?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Dr. Naledi Mokoena',
      role: 'Restorative & Implant Dentist',
      qualifications: 'BChD, University of the Western Cape',
      experience: '10+ years experience in restorative dentistry and smile rehabilitation',
      philosophy: 'Focused on restoring function and confidence with modern digital workflows and patient-first care.',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Dr. Ethan Brooks',
      role: 'Orthodontic & Preventive Care Dentist',
      qualifications: 'BDS, Wits University',
      experience: '12+ years experience in alignment planning and preventive care',
      philosophy: 'Passionate about helping children and adults build healthy habits while achieving confident smiles.',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=80'
    }
  ];

  readonly services: ServiceItem[] = [
    {
      category: 'General Dentistry',
      title: 'Checkups & Preventive Care',
      description: 'Routine examinations, digital diagnostics, and gentle cleanings to keep your teeth and gums healthy year-round.',
      steps: ['Consultation and oral exam', 'Cleaning and plaque removal', 'Personalised prevention plan'],
      price: 'From R750'
    },
    {
      category: 'General Dentistry',
      title: 'Fillings & Root Canal Care',
      description: 'Comfort-focused treatment for tooth decay and infection using modern techniques designed to preserve your natural tooth.',
      steps: ['Assessment and X-rays', 'Treatment planning', 'Restoration and aftercare'],
      price: 'From R950'
    },
    {
      category: 'Cosmetic Dentistry',
      title: 'Teeth Whitening & Veneers',
      description: 'Brighten and refine your smile with safe whitening options and custom veneers tailored to your facial aesthetics.',
      steps: ['Smile consultation', 'Shade and design planning', 'Treatment and review'],
      price: 'From R2 500'
    },
    {
      category: 'Restorative Dentistry',
      title: 'Crowns, Bridges & Implants',
      description: 'Restore confidence, function, and bite stability with durable options designed for a natural-looking result.',
      steps: ['Clinical assessment', 'Digital impressions', 'Placement and follow-up'],
      price: 'Quote on consultation'
    },
    {
      category: 'Orthodontics',
      title: 'Braces & Clear Aligners',
      description: 'Straighten your teeth with treatment plans that fit both teenagers and adults seeking a confident smile.',
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
      name: 'Nomsa K.',
      quote: 'Very gentle dentist. My kids love coming here, and the booking process was quick and simple.',
      service: 'Family dentistry'
    },
    {
      name: 'Daniel M.',
      quote: 'I came in for whitening and left with much more confidence. The team explained everything clearly.',
      service: 'Cosmetic dentistry'
    },
    {
      name: 'Ayanda P.',
      quote: 'I had an emergency toothache and they helped me the same day. Friendly staff and excellent care.',
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

  readonly medicalAids = ['Discovery Health', 'Bonitas', 'Momentum Health', 'Fedhealth', 'Bestmed'];
  readonly paymentOptions = ['Cash', 'Card', 'EFT', 'Medical aid claims'];

  readonly gallery: GalleryItem[] = [
    {
      title: 'Whitening refresh',
      label: 'Before & after whitening',
      image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Smile makeover',
      label: 'Veneers consultation journey',
      image: 'https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Healthy alignment',
      label: 'Orthodontic transformation',
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
      excerpt: 'Learn the right age for an orthodontic evaluation and what early signs to watch for.'
    },
    {
      tag: 'Cosmetic Care',
      title: 'Teeth whitening tips that protect enamel',
      excerpt: 'Understand which whitening options are safe, effective, and worth considering.'
    }
  ];

  readonly faqs: FaqItem[] = [
    {
      question: 'Does teeth whitening hurt?',
      answer: 'Most patients experience little to no discomfort. We assess sensitivity first and recommend the safest option for your teeth.'
    },
    {
      question: 'How often should I visit the dentist?',
      answer: 'A checkup every 6 months is a good rule for most patients, although your dentist may recommend more frequent visits based on your needs.'
    },
    {
      question: 'Do you accept medical aid?',
      answer: 'Yes. We work with several major medical aids and can discuss claims support during your appointment booking.'
    },
    {
      question: 'Can I book an emergency appointment?',
      answer: 'Yes. Call our emergency line for urgent pain, swelling, bleeding, or broken teeth so we can prioritise your care.'
    }
  ];

  readonly formLinks = ['New patient form', 'Medical history form', 'Consent form'];

  readonly contact = {
    address: '123 Main Road, Johannesburg',
    phone: '011 123 4567',
    emergencyPhone: '082 123 4567',
    email: 'hello@smilecraftdental.co.za',
    hours: 'Mon–Fri 08:00 – 17:00 · Sat 09:00 – 13:00'
  };
}
