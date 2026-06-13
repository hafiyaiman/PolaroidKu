import { getUserEvents } from "./_actions/event-actions";
import { EventsListView } from "./_components/events-list-view";

export default async function Page() {
  const events = await getUserEvents();

  return <EventsListView initialEvents={events} />;
}
