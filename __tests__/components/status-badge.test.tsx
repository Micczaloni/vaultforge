import { render, screen } from "@testing-library/react";

import { StatusBadge } from "@/components/shared/status-badge";

describe("StatusBadge", () => {
  it("renders an accessible status label", () => {
    render(<StatusBadge status="PLAYING" />);
    expect(screen.getByText("Playing")).toBeInTheDocument();
    expect(screen.getByText(/Library status/i)).toBeInTheDocument();
  });
});
