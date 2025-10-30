import { EventItem } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

const EventCard = ({ title, image, location, slug, date, time }: EventItem) => {
  return (
    <Link href={`/events/${slug}`} className="event-card">
      <Image
        className="poster"
        src={image}
        alt={title}
        width={410}
        height={300}
      />
      <div className="flex gap-2">
        <Image src={"/icons/pin.svg"} alt="location" width={14} height={14} />
        <p>{location}</p>
      </div>
      <div className="datetime flex flex-wrap gap-4">
        <div className="flex gap-2">
          <Image
            src={"/icons/calendar.svg"}
            alt="date"
            width={14}
            height={14}
          />
          <p>{date}</p>
        </div>
        <div className="flex gap-2">
          <Image src={"/icons/clock.svg"} alt="time" width={14} height={14} />
          <p>{time}</p>
        </div>
      </div>
      <p className="title">{title}</p>
    </Link>
  );
};

export default EventCard;
