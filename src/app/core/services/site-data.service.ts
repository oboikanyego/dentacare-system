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
  readonly clinicName = 'DentaCare';
  readonly city = 'Johannesburg';
  readonly tagline = 'Modern dental care, made simpler';
  readonly intro = 'Book visits, explore services, and manage appointments through one clean patient and clinic experience.';

  readonly featuredServices = [
    'Same-day checkups',
    'Teeth cleaning',
    'Teeth whitening',
    'Emergency care'
  ];

  readonly dentists: DentistItem[] = [
    {
      name: 'Dr. Maya Vale',
      role: 'Family & Cosmetic Dentist',
      qualifications: 'BDS, DentaCare Clinical Institute',
      experience: '12+ years in family and cosmetic dentistry',
      philosophy: 'Gentle care, clear explanations, and comfort-first treatment planning.',
      image: 'https://images.unsplash.com/photo-1612277795421-9bc7706a4a41?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Dr. Theo Lane',
      role: 'Restorative Dentist',
      qualifications: 'BChD, DentaCare Clinical Institute',
      experience: '10+ years in restorative and rehabilitation care',
      philosophy: 'Modern restorative workflows paired with practical, patient-friendly treatment planning.',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Dr. Zuri Hart',
      role: 'Orthodontic & Preventive Dentist',
      qualifications: 'BDS, DentaCare Clinical Institute',
      experience: '9+ years in alignment and preventive care',
      philosophy: 'Preventive habits, thoughtful alignment planning, and accessible patient education.',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=80'
    }
  ];

  readonly services: ServiceItem[] = [
    {
      category: 'General Dentistry',
      title: 'Checkups & Preventive Care',
      description: 'Routine examinations, diagnostics, cleaning, and preventive guidance.',
      steps: ['Consultation and oral exam', 'Cleaning and plaque removal', 'Personal prevention plan'],
      price: 'From R750'
    },
    {
      category: 'General Dentistry',
      title: 'Fillings & Root Canal Care',
      description: 'Comfort-focused treatment options for decay, sensitivity, and infection.',
      steps: ['Assessment and X-rays', 'Treatment planning', 'Restoration and aftercare'],
      price: 'From R950'
    },
    {
      category: 'Cosmetic Dentistry',
      title: 'Teeth Whitening & Veneers',
      description: 'Whitening and veneer planning designed around a natural-looking smile.',
      steps: ['Smile consultation', 'Shade and design planning', 'Treatment and review'],
      price: 'From R2 500'
    },
    {
      category: 'Restorative Dentistry',
      title: 'Crowns, Bridges & Implants',
      description: 'Restorative treatment planning focused on function, comfort, and long-term follow-up.',
      steps: ['Clinical assessment', 'Digital impressions', 'Placement and follow-up'],
      price: 'Quote on consultation'
    },
    {
      category: 'Orthodontics',
      title: 'Braces & Clear Aligners',
      description: 'Alignment planning with structured progress reviews throughout treatment.',
      steps: ['Orthodontic assessment', 'Custom treatment plan', 'Progress reviews'],
      price: 'From R1 250 / consult'
    },
    {
      category: 'Emergency Dental Care',
      title: 'Urgent Dental Relief',
      description: 'Fast triage, stabilisation, and follow-up planning for urgent dental concerns.',
      steps: ['Emergency triage', 'Pain relief and stabilisation', 'Next-step treatment plan'],
      price: 'Pricing available during booking'
    }
  ];

  readonly reviews: ReviewItem[] = [
    {
      name: 'John Doe',
      quote: 'The booking process was simple, clear, and easy to follow from start to finish.',
      service: 'Family dentistry'
    },
    {
      name: 'Jane Doe',
      quote: 'I liked how clearly the treatment options and appointment details were explained.',
      service: 'Cosmetic dentistry'
    },
    {
      name: 'Sam Taylor',
      quote: 'The urgent booking flow made it easy to understand the next available steps.',
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

  readonly medicalAids = ['Health Plan A', 'Health Plan B', 'Health Plan C'];
  readonly paymentOptions = ['Cash', 'Card', 'EFT', 'Health-plan claim'];

  readonly gallery: GalleryItem[] = [
    {
      title: 'Whitening refresh',
      label: 'Illustrative sample result',
      image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Smile makeover',
      label: 'Illustrative sample result',
      image: 'https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Healthy alignment',
      label: 'Illustrative sample result',
      image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  readonly articles: BlogItem[] = [
    {
      tag: 'Dental Education',
      title: 'How to prevent cavities between appointments',
      excerpt: 'Practical oral-care habits that can help support a healthy routine between visits.'
    },
    {
      tag: 'Orthodontics',
      title: 'When should children get braces assessed?',
      excerpt: 'A simple overview of when an orthodontic assessment may be worth discussing.'
    },
    {
      tag: 'Cosmetic Care',
      title: 'Teeth whitening tips that protect enamel',
      excerpt: 'Things to consider before whitening and how to keep enamel care in mind.'
    }
  ];

  readonly faqs: FaqItem[] = [
    {
      question: 'Does teeth whitening hurt?',
      answer: 'Sensitivity can vary. A clinician would normally discuss options based on the patient and treatment plan.'
    },
    {
      question: 'How often should I visit the dentist?',
      answer: 'Visit frequency depends on the patient and their oral-health needs. A dentist can recommend an appropriate schedule.'
    },
    {
      question: 'Do you accept medical aid?',
      answer: 'The application includes sample health-plan options to demonstrate payment and claim workflows.'
    },
    {
      question: 'Can I book an emergency appointment?',
      answer: 'Yes. The booking flow includes urgent appointment scenarios and same-day availability where configured.'
    }
  ];

  readonly formLinks = ['New-patient form', 'Medical-history form', 'Consent form'];

  readonly contact = {
    address: '100 Cedar Avenue, Parkview, Johannesburg',
    phone: '010 000 0000',
    emergencyPhone: '010 000 0001',
    email: 'hello@dentacare.example',
    hours: 'Mon–Fri 08:00–17:00 · Sat 09:00–13:00'
  };
}
