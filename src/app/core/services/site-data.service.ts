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
  readonly clinicName = 'DentaCare Demo Clinic';
  readonly city = 'Johannesburg Demo';
  readonly tagline = 'Portfolio demo for a modern dental practice';
  readonly intro = 'A fictional dental-practice experience created to demonstrate online booking, role-based workflows, responsive UI, and clear patient communication.';

  readonly featuredServices = [
    'Demo same-day checkups',
    'Demo teeth cleaning',
    'Demo whitening',
    'Demo emergency care'
  ];

  readonly dentists: DentistItem[] = [
    {
      name: 'Dr. Maya Vale (Demo)',
      role: 'Demo Family & Cosmetic Dentist',
      qualifications: 'Demo BDS, DentaCare Clinical Institute',
      experience: '12+ fictional years of family and cosmetic dentistry experience',
      philosophy: 'Demo profile focused on gentle care, clear explanations, and comfort-first treatment planning.',
      image: 'https://images.unsplash.com/photo-1612277795421-9bc7706a4a41?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Dr. Theo Lane (Demo)',
      role: 'Demo Restorative Dentist',
      qualifications: 'Demo BChD, DentaCare Clinical Institute',
      experience: '10+ fictional years of restorative and rehabilitation experience',
      philosophy: 'Demo profile illustrating modern restorative workflows and patient-friendly treatment planning.',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Dr. Zuri Hart (Demo)',
      role: 'Demo Orthodontic & Preventive Dentist',
      qualifications: 'Demo BDS, DentaCare Clinical Institute',
      experience: '9+ fictional years of alignment and preventive-care experience',
      philosophy: 'Demo profile focused on preventive habits, alignment planning, and accessible patient education.',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=80'
    }
  ];

  readonly services: ServiceItem[] = [
    {
      category: 'General Dentistry',
      title: 'Checkups & Preventive Care',
      description: 'Demo service content for routine examinations, diagnostics, and preventative cleaning workflows.',
      steps: ['Demo consultation and oral exam', 'Demo cleaning and plaque removal', 'Demo prevention plan'],
      price: 'Demo price: from R750'
    },
    {
      category: 'General Dentistry',
      title: 'Fillings & Root Canal Care',
      description: 'Demo service content showing a comfort-focused treatment journey for decay and infection.',
      steps: ['Demo assessment and X-rays', 'Demo treatment planning', 'Demo restoration and aftercare'],
      price: 'Demo price: from R950'
    },
    {
      category: 'Cosmetic Dentistry',
      title: 'Teeth Whitening & Veneers',
      description: 'Demo cosmetic-service content for whitening and veneer planning within the portfolio experience.',
      steps: ['Demo smile consultation', 'Demo shade and design planning', 'Demo treatment and review'],
      price: 'Demo price: from R2 500'
    },
    {
      category: 'Restorative Dentistry',
      title: 'Crowns, Bridges & Implants',
      description: 'Demo restorative-service content illustrating treatment planning and follow-up workflows.',
      steps: ['Demo clinical assessment', 'Demo digital impressions', 'Demo placement and follow-up'],
      price: 'Demo price: quote on consultation'
    },
    {
      category: 'Orthodontics',
      title: 'Braces & Clear Aligners',
      description: 'Demo orthodontic-service content for alignment planning and recurring progress reviews.',
      steps: ['Demo orthodontic assessment', 'Demo custom treatment plan', 'Demo progress reviews'],
      price: 'Demo price: from R1 250 / consult'
    },
    {
      category: 'Emergency Dental Care',
      title: 'Urgent Dental Relief',
      description: 'Demo emergency-service content for showcasing triage, stabilisation, and follow-up scheduling.',
      steps: ['Demo emergency triage', 'Demo pain relief and stabilisation', 'Demo next-step treatment plan'],
      price: 'Demo pricing available during booking'
    }
  ];

  readonly reviews: ReviewItem[] = [
    {
      name: 'Demo Patient A',
      quote: 'Fictional testimonial used to demonstrate how patient feedback can be presented in the interface.',
      service: 'Demo family dentistry'
    },
    {
      name: 'Demo Patient B',
      quote: 'Fictional testimonial showing a positive cosmetic-care journey and clear communication.',
      service: 'Demo cosmetic dentistry'
    },
    {
      name: 'Demo Patient C',
      quote: 'Fictional testimonial showing how an urgent-care experience could be represented.',
      service: 'Demo emergency care'
    }
  ];

  readonly pricing: PricingItem[] = [
    { service: 'Dental cleaning', price: 'Demo R750' },
    { service: 'White filling', price: 'Demo R950' },
    { service: 'Emergency consultation', price: 'Demo R850' },
    { service: 'Teeth whitening', price: 'Demo R2 500' },
    { service: 'Orthodontic consultation', price: 'Demo R1 250' }
  ];

  readonly medicalAids = ['Demo Health Plan A', 'Demo Health Plan B', 'Demo Health Plan C'];
  readonly paymentOptions = ['Demo cash option', 'Demo card option', 'Demo EFT option', 'Demo health-plan claim'];

  readonly gallery: GalleryItem[] = [
    {
      title: 'Demo whitening refresh',
      label: 'Illustrative portfolio gallery item',
      image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Demo smile makeover',
      label: 'Illustrative portfolio gallery item',
      image: 'https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=1200&q=80'
    },
    {
      title: 'Demo healthy alignment',
      label: 'Illustrative portfolio gallery item',
      image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  readonly articles: BlogItem[] = [
    {
      tag: 'Demo Dental Education',
      title: 'How to prevent cavities between appointments',
      excerpt: 'Demo educational copy showing how clinic articles could be presented to visitors.'
    },
    {
      tag: 'Demo Orthodontics',
      title: 'When should children get braces assessed?',
      excerpt: 'Demo educational copy for an orthodontic article card in this portfolio project.'
    },
    {
      tag: 'Demo Cosmetic Care',
      title: 'Teeth whitening tips that protect enamel',
      excerpt: 'Demo educational copy for a cosmetic-care article card in this portfolio project.'
    }
  ];

  readonly faqs: FaqItem[] = [
    {
      question: 'Does teeth whitening hurt?',
      answer: 'Demo answer: the application can present guidance here, but this portfolio content is not medical advice.'
    },
    {
      question: 'How often should I visit the dentist?',
      answer: 'Demo answer: a real clinic would tailor this guidance to the patient and their clinical needs.'
    },
    {
      question: 'Do you accept medical aid?',
      answer: 'Demo answer: this portfolio build uses fictional health-plan options only.'
    },
    {
      question: 'Can I book an emergency appointment?',
      answer: 'Demo answer: the booking flow demonstrates how urgent appointment requests could be captured.'
    }
  ];

  readonly formLinks = ['Demo new-patient form', 'Demo medical-history form', 'Demo consent form'];

  readonly contact = {
    address: '100 Demo Avenue, Example Park, Johannesburg',
    phone: '010 000 0000',
    emergencyPhone: '010 000 0001',
    email: 'hello@dentacare.example',
    hours: 'Demo hours: Mon–Fri 08:00–17:00 · Sat 09:00–13:00'
  };
}
