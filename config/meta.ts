export const siteConfig = {
  name: "Trakiti Shipment Tracker",
  shortName: "Trakiti",
  description:
    "Reliable and real-time shipment tracking solutions for businesses and individuals worldwide. Stay informed every step of the way with Trakiti.",

  // Contact Information
  contact: {
    phone: {
      primary: "+256(0) 762063160",
      emergency: "+256(0) 756384580",
      whatsapp: "+256(0) 762063160",
    },
    email: {
      primary: "support@trakiti.com",
      support: "info@trakiti.com",
      appointments: "contact@trakiti.com",
    },
    address: {
      street: "Plot 21 Logistics Park",
      city: "Kampala",
      country: "Uganda",
      coordinates: {
        latitude: "0.347596",
        longitude: "32.582520",
      },
    },
  },

  // Social Media Links
  social: {
    facebook: "https://facebook.com/trakiti",
    twitter: "https://twitter.com/trakiti",
    instagram: "https://instagram.com/trakiti",
    linkedin: "https://linkedin.com/company/trakiti",
    youtube: "https://youtube.com/@trakiti",
  },

  // Working Hours
  workingHours: {
    status: "24/7 All Week Days",
    emergency: "24/7 Customer Support",
    outpatient: "Monday - Saturday: 9:00 AM - 6:00 PM", // Optional adjustment
    pharmacy: "N/A",
    laboratory: "N/A",
  },

  // Company Meta Information
  meta: {
    foundedYear: 2021,
    license: "Licensed by Uganda Communications Commission",
    accreditation: "Certified Logistics Tech Provider",
    values: [
      {
        title: "Transparency",
        description: "Providing real-time, accurate tracking updates.",
      },
      {
        title: "Efficiency",
        description: "Streamlining logistics through technology.",
      },
      {
        title: "Trust",
        description: "Building long-term relationships through reliability.",
      },
    ],
  },

  // Service Categories
  services: {
    emergency: [
      "Lost Shipment Assistance",
      "24/7 Live Support",
      "Urgent Tracking Updates",
      "Priority Escalation Services",
    ],
    specialties: [
      "Real-Time Tracking",
      "International Shipment Monitoring",
      "Local Courier Integration",
      "Delivery Notifications",
      "Proof of Delivery",
    ],
    supportServices: [
      "Customer Dashboard",
      "Mobile App Support",
      "Custom Notifications",
      "API Integrations",
      "Data Analytics & Reporting",
    ],
  },

  // SEO and Metadata
  seo: {
    title: "Trakiti - Real-Time Shipment Tracking Made Easy",
    description:
      "Trakiti offers global shipment tracking solutions, real-time updates, and smart logistics tools for personal and business use.",
    keywords: [
      "shipment tracking",
      "logistics",
      "real-time tracking",
      "courier tracking",
      "delivery updates",
      "Trakiti",
      "track package",
      "Uganda",
    ],
    ogImage: "https://img.freepik.com/free-photo/aerial-view-cargo-ship-cargo-container-harbor_335224-1380.jpg?ga=GA1.1.1036439435.1744115746&semt=ais_hybrid&w=740",
  },

  // Legal Information
  legal: {
    name: "Trakiti Logistics Ltd",
    registration: "UG987654321",
    privacyPolicy: "/privacy-policy",
    terms: "/terms-and-conditions",
    accessibility: "/accessibility",
  },

  // Appointment Types (adjusted to service requests)
  appointmentTypes: [
    {
      id: "demo",
      name: "Product Demo",
      duration: "30 minutes",
    },
    {
      id: "consultation",
      name: "Logistics Consultation",
      duration: "45 minutes",
    },
    {
      id: "support",
      name: "Technical Support Call",
      duration: "20 minutes",
    },
  ],

  // Insurance and Payment (adjusted to logistics context)
  insurance: {
    accepted: [
      "Shipment Insurance Partners",
      "Logistics Protection Plans",
    ],
    paymentMethods: ["Credit Card", "Mobile Money", "Bank Transfer"],
  },
};

// Helper function to get formatted contact info
export const getContactInfo = () => {
  const { contact } = siteConfig;
  return {
    mainPhone: contact.phone.primary,
    emergency: contact.phone.emergency,
    email: contact.email.primary,
    fullAddress: `${contact.address.street}, ${contact.address.city}, ${contact.address.country}`,
  };
};

// Helper function to get social media links
export const getSocialLinks = () => {
  return siteConfig.social;
};

// Helper function to get working hours
export const getWorkingHours = () => {
  return siteConfig.workingHours;
};

// Helper function to get SEO metadata
export const getSEOData = (pageName?: string) => {
  return {
    title: pageName ? `${pageName} - ${siteConfig.name}` : siteConfig.seo.title,
    description: siteConfig.seo.description,
    keywords: siteConfig.seo.keywords.join(", "),
    ogImage: siteConfig.seo.ogImage,
  };
};
