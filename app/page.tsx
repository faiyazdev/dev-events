import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { events } from "@/lib/constants";

const Home = () => {
  return (
    <section>
      <h1 className="text-center">
        The Hub for every Dev <br />
        Event you Can&apos;t miss
      </h1>
      <p className="text-center mt-10">
        Hackatons, Meetups, Conferences All in one place!
      </p>
      <ExploreBtn />
      <div className="mt-20 space-y-7">
        <h3>Explore Events</h3>
        <ul className="events">
          {events?.map((event) => (
            <li key={event.slug}>
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Home;
