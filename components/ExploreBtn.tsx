"use client";

const ExploreBtn = () => {
  return (
    <button
      id="explore-btn"
      className="mt-7 mx-auto"
      onClick={() => console.log("h")}
    >
      <a href="/events">Explore Events</a>
    </button>
  );
};

export default ExploreBtn;
