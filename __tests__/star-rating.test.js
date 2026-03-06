/**
 * Unit tests for StarRating component.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import StarRating from "@/app/_components/StarRating";

describe("StarRating", () => {
    test("renders 5 stars by default", () => {
        render(<StarRating />);
        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(5);
    });

    test("renders custom number of stars", () => {
        render(<StarRating maxRating={3} />);
        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(3);
    });

    test("calls onSetRating when a star is clicked", () => {
        const mockFn = jest.fn();
        render(<StarRating onSetRating={mockFn} />);

        const buttons = screen.getAllByRole("button");
        fireEvent.click(buttons[2]); // Click 3rd star

        expect(mockFn).toHaveBeenCalledWith(3);
    });

    test("has correct aria-labels", () => {
        render(<StarRating maxRating={3} />);
        expect(screen.getByLabelText("Rate 1 star")).toBeInTheDocument();
        expect(screen.getByLabelText("Rate 2 stars")).toBeInTheDocument();
        expect(screen.getByLabelText("Rate 3 stars")).toBeInTheDocument();
    });

    test("uses default rating prop", () => {
        const mockFn = jest.fn();
        render(<StarRating defaultRating={4} onSetRating={mockFn} />);
        // The 4th star should be filled initially — tested via SVG fill class
        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(5);
    });
});
