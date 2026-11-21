export interface TeamMember {
  id: string;
  title: string;
  subtitle: string;
  image: string | null;
  borderColor: string;
  gradient: string;
  sortOrder: number;
  url?: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "ali-haider",
    title: "Ali Haider",
    subtitle: "Founder & AI Engineer",
    image: "/team-images/team1.webp",
    borderColor: "#38BDF8",
    gradient: "linear-gradient(145deg, #38BDF8, #050B14)",
    sortOrder: 1,
  },
  {
    id: "irfan-ul-haq",
    title: "Irfan Ul Haq",
    subtitle: "UI/UX Designer",
    image: "/team-images/team1.webp",
    borderColor: "#0EA5E9",
    gradient: "linear-gradient(210deg, #0EA5E9, #050B14)",
    sortOrder: 2,
  },
  {
    id: "muhammad-faizan",
    title: "Muhammad Faizan",
    subtitle: "Automation Engineer",
    image: "/team-images/team1.webp",
    borderColor: "#22D3EE",
    gradient: "linear-gradient(165deg, #22D3EE, #050B14)",
    sortOrder: 3,
  },
  {
    id: "saad-arif",
    title: "Ahmed Ali",
    subtitle: "SOC Analyst",
    image: "/team-images/Baloch.jpg",
    borderColor: "#0EA5E9",
    gradient: "linear-gradient(145deg, #0EA5E9, #050B14)",
    sortOrder: 4,
  },
  {
    id: "laraib",
    title: "Laraib",
    subtitle: "Full-Stack Developer",
    image: "/team-images/team1.webp",
    borderColor: "#2563EB",
    gradient: "linear-gradient(225deg, #2563EB, #050B14)",
    sortOrder: 5,
  },
  {
    id: "muhammad-rizwan",
    title: "Muhammad Rizwan",
    subtitle: "Data Scientist",
    image: "/team-images/team1.webp",
    borderColor: "#0891B2",
    gradient: "linear-gradient(135deg, #0891B2, #050B14)",
    sortOrder: 6,
  },
];
