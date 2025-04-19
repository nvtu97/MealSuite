import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Ticket, User } from "@acme/shared-models";

/* eslint-disable-next-line */
export interface TicketDetailsProps {
  users: User[];
}

export function TicketDetails(props: TicketDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<User[]>(props.users);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [editedStatus, setEditedStatus] = useState(false);
  const [editedAssigneeId, setEditedAssigneeId] = useState<number | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const ticketRes = await fetch(`/api/tickets/${id}`);
      const ticketData = await ticketRes.json();

      setTicket(ticketData);
      setEditedStatus(ticketData.completed);
      setEditedAssigneeId(ticketData.assigneeId);
    } catch (error) {
      console.error("Error loading ticket detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setUsers(props.users);
  }, [props.users]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!ticket) return;

    try {
      // Handle completion
      if (editedStatus && !ticket.completed) {
        await fetch(`/api/tickets/${ticket.id}/complete`, { method: "PUT" });
      } else if (!editedStatus && ticket.completed) {
        await fetch(`/api/tickets/${ticket.id}/complete`, { method: "DELETE" });
      }

      // Handle assignee
      if (editedAssigneeId && editedAssigneeId !== ticket.assigneeId) {
        await fetch(`/api/tickets/${ticket.id}/assign/${editedAssigneeId}`, {
          method: "PUT",
        });
      } else if (!editedAssigneeId && ticket.assigneeId) {
        await fetch(`/api/tickets/${ticket.id}/unassign`, { method: "PUT" });
      }

      // Refetch updated ticket
      await fetchData();
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save changes:", err);
    }
  };

  if (isLoading || !ticket)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded mt-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Ticket Detail</h2>

      <div>
        <label className="block text-gray-600">Ticket ID:</label>
        <p className="font-mono">{ticket.id}</p>
      </div>

      <div>
        <label className="block text-gray-600">Description:</label>
        <p>{ticket.description}</p>
      </div>

      <div>
        <label className="block text-gray-600">Status:</label>
        {isEditing ? (
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={editedStatus}
              onChange={(e) => setEditedStatus(e.target.checked)}
              className="mr-2"
            />
            {editedStatus ? "Completed" : "Incomplete"}
          </label>
        ) : (
          <p>{ticket.completed ? "Completed" : "Incomplete"}</p>
        )}
      </div>

      <div>
        <label className="block text-gray-600">Assignee:</label>
        {isEditing ? (
          <select
            className="border p-2 rounded w-full"
            value={editedAssigneeId ?? ""}
            onChange={(e) => setEditedAssigneeId(Number(e.target.value))}
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        ) : (
          <p>
            {users.find((user) => user.id === ticket.assigneeId)?.name ||
              "Unassigned"}
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Edit
          </button>
        )}

        <button
          onClick={() => navigate("/")}
          className="ml-auto bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default TicketDetails;
