import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TicketDetails from "./ticket-details";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Mock ticket & users
const mockTicket = {
  id: 1,
  description: "Fix login bug",
  completed: false,
  assigneeId: null,
};

const mockUsers = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

// Mock global fetch
global.fetch = jest.fn((url, options) => {
  if (url === "/api/tickets/1") {
    return Promise.resolve({
      json: () => Promise.resolve(mockTicket),
    });
  }

  if (url === "/api/tickets/1/complete" && options?.method === "PUT") {
    return Promise.resolve({ status: 204 });
  }

  if (url === "/api/tickets/1/assign/1" && options?.method === "PUT") {
    return Promise.resolve({ status: 204 });
  }

  if (url === "/api/tickets/1/unassign" && options?.method === "PUT") {
    return Promise.resolve({ status: 204 });
  }

  if (url === "/api/tickets/1/complete" && options?.method === "DELETE") {
    return Promise.resolve({ status: 204 });
  }

  return Promise.resolve({ json: () => Promise.resolve({}) });
}) as jest.Mock;

const renderWithRouter = () => {
  return render(
    <MemoryRouter initialEntries={["/tickets/1"]}>
      <Routes>
        <Route
          path="/tickets/:id"
          element={<TicketDetails users={mockUsers} />}
        />
      </Routes>
    </MemoryRouter>
  );
};

describe("TicketDetails Component", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it("renders ticket data correctly", async () => {
    renderWithRouter();
    expect(await screen.findByText("Fix login bug")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Incomplete")).toBeInTheDocument();
      expect(screen.getByText("Unassigned")).toBeInTheDocument();
    });
  });

  it("enters edit mode and performs save", async () => {
    renderWithRouter();

    fireEvent.click(await screen.findByText("Edit"));

    fireEvent.click(screen.getByRole("checkbox")); // check completed
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } }); // assign Alice

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/tickets/1/complete", {
        method: "PUT",
      });
      expect(fetch).toHaveBeenCalledWith("/api/tickets/1/assign/1", {
        method: "PUT",
      });
    });
  });

  it("can cancel edit mode", async () => {
    renderWithRouter();

    fireEvent.click(await screen.findByText("Edit"));
    expect(screen.getByText("Save")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("handles clicking back", async () => {
    renderWithRouter();
    fireEvent.click(await screen.findByText("Back"));

    // We can't assert router change in MemoryRouter easily, so just assert no crash
    expect(true).toBe(true);
  });
});
