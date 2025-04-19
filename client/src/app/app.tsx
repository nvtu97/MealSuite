import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Ticket, User } from "@acme/shared-models";

import styles from "./app.module.css";
import Tickets from "./tickets/tickets";
import TicketDetails from "./ticket-details/ticket-details";

const App = () => {
  const [users, setUsers] = useState([] as User[]);

  // Very basic way to synchronize state with server.
  // Feel free to use any state/fetch library you want (e.g. react-query, xstate, redux, etc.).
  useEffect(() => {
    async function fetchUsers() {
      const data = await fetch("/api/users").then();
      setUsers(await data.json());
    }

    fetchUsers();
  }, []);

  return (
    <div className={styles["app"]}>
      <h1>Ticketing App</h1>
      <Routes>
        <Route path="/" element={<Tickets users={users} />} />
        {/* Hint: Try `npx nx g component TicketDetails --project=client --no-export` to generate this component  */}
        <Route path="/:id" element={<TicketDetails users={users} />} />
      </Routes>
    </div>
  );
};

export default App;
