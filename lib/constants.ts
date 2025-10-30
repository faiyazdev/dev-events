export interface EventItem {
  slug: string;
  image: string;
  title: string;
  location: string;
  date: string;
  time: string;
}
export const events: EventItem[] = [
  {
    slug: "react-conf-2024",
    image: "/images/event1.png",
    title: "React Conf 2024",
    location: "San Francisco, CA",
    date: "March 15, 2024",
    time: "9:00 AM - 6:00 PM",
  },
  {
    slug: "nextjs-summit",
    image: "/images/event2.png",
    title: "Next.js Summit",
    location: "Austin, TX",
    date: "April 22, 2024",
    time: "10:00 AM - 5:00 PM",
  },
  {
    slug: "javascript-world",
    image: "/images/event3.png",
    title: "JavaScript World Conference",
    location: "New York, NY",
    date: "May 8, 2024",
    time: "8:30 AM - 7:00 PM",
  },
  {
    slug: "ai-hackathon-2024",
    image: "/images/event4.png",
    title: "AI Innovation Hackathon",
    location: "Seattle, WA",
    date: "June 14-16, 2024",
    time: "48 Hours",
  },
  {
    slug: "web3-developer-meetup",
    image: "/images/event5.png",
    title: "Web3 Developer Meetup",
    location: "Miami, FL",
    date: "July 20, 2024",
    time: "6:00 PM - 9:00 PM",
  },
  {
    slug: "fullstack-conference",
    image: "/images/event6.png",
    title: "Full Stack Conference",
    location: "Denver, CO",
    date: "August 12, 2024",
    time: "9:00 AM - 6:00 PM",
  },
];
