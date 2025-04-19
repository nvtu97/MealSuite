import { Ticket, User } from "@acme/shared-models";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export interface TicketsProps {
  users: User[];
}

export function Tickets(props: TicketsProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "completed" | "incomplete"
  >("all");
  const [newDescription, setNewDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (filterStatus === "completed") {
      setFilteredTickets(tickets.filter((t) => t.completed));
    } else if (filterStatus === "incomplete") {
      setFilteredTickets(tickets.filter((t) => !t.completed));
    } else {
      setFilteredTickets(tickets);
    }
  }, [tickets, filterStatus]);

  const getUserName = (userId: number | null) => {
    return props.users.find((v) => v.id === userId)?.name ?? "";
  };

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/tickets");
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) return;

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: newDescription }),
      });
      const newTicket = await res.json();
      setTickets((prev) => [...prev, newTicket]);
      setNewDescription("");
    } catch (err) {
      console.error("Failed to add ticket:", err);
    }
  };

  const handleRowClick = (id: number) => {
    navigate(`/${id}`);
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <>
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Ticket List</h2>

        <form onSubmit={handleAddTicket} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Enter ticket description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="flex-grow border rounded px-3 py-2"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </form>

        <div className="mb-4">
          <label className="mr-2 font-medium">Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border p-2 rounded"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>

        <table className="w-full table-auto border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">ID</th>
              <th className="border px-4 py-2 text-left">Description</th>
              <th className="border px-4 py-2 text-left">Status</th>
              <th className="border px-4 py-2 text-left">Assignee</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => handleRowClick(ticket.id)}
              >
                <td className="border px-4 py-2">{ticket.id}</td>
                <td className="border px-4 py-2">{ticket.description}</td>
                <td className="border px-4 py-2">
                  {ticket.completed ? "Completed" : "Incomplete"}
                </td>
                <td className="border px-4 py-2">
                  {getUserName(ticket.assigneeId)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Tickets;
