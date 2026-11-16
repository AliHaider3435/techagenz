export interface Testimonial {
  quote: string;
  name: string;
  designation: string;
  src?: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "Tech Agenz engineered a modern, authoritative legal portal for our law chamber. Client inquiries, case consultation bookings, and digital intakes are now handled seamlessly.",
    name: "Advocate Muhammad Usman",
    designation: "Managing Partner at Garwan Law Chamber",
  },
  {
    quote:
      "The appointment booking and queue management system transformed our patient scheduling. Patient wait times dropped and scheduling via mobile is effortless.",
    name: "Dr. Iqbal Ahmad Kharal",
    designation: "Head of Clinical Services",
  },
  {
    quote:
      "A reliable, beautifully built healthcare scheduling platform. Tech Agenz delivered ahead of schedule with exceptional technical execution.",
    name: "Dr. Sajid Sohail",
    designation: "Consultant Physician",
  },
  {
    quote:
      "Their autonomous workflow pipelines streamlined our operations and cut manual processing time in half. True engineering discipline and applied AI.",
    name: "Hamza Tariq",
    designation: "Founder at FinEdge Systems",
  },
  {
    quote:
      "High-performance architecture, clean animations, and rock-solid reliability. Tech Agenz is our go-to engineering partner for digital platforms.",
    name: "Asad Malik",
    designation: "Operations Director at ScaleCloud",
  },
];
