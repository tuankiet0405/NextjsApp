/**
 * Unit tests for server action validation logic.
 * Tests the pure validation logic extracted from server actions.
 */

// ── Extracted validation functions ──

function validateReservation({ numGuests, maxCapacity, startDate, endDate }) {
    if (!startDate || !endDate) return "Please select dates";
    if (numGuests < 1) return "At least 1 guest required";
    if (numGuests > maxCapacity) return `Maximum ${maxCapacity} guests allowed`;
    if (new Date(startDate) >= new Date(endDate))
        return "Check-out must be after check-in";
    return null; // valid
}

function validateSignUp({ fullName, email, password, policyAccepted }) {
    if (!fullName || !email || !password) return "All fields are required";
    if (password.length < 8) {
        return "Password must be at least 8 characters";
    }
    if (!policyAccepted) {
        return "You must accept the privacy policy and terms";
    }
    return null; // valid
}

function validateReview({ rating, bookingId }) {
    if (!bookingId) return "Missing booking ID";
    if (!rating || rating < 1 || rating > 5) return "Rating must be 1-5";
    return null; // valid
}

// ── Tests ──

describe("validateReservation", () => {
    const base = {
        numGuests: 2,
        maxCapacity: 5,
        startDate: "2026-06-01",
        endDate: "2026-06-05",
    };

    test("valid reservation passes", () => {
        expect(validateReservation(base)).toBeNull();
    });

    test("rejects missing dates", () => {
        expect(validateReservation({ ...base, startDate: null })).toBe(
            "Please select dates"
        );
    });

    test("rejects zero guests", () => {
        expect(validateReservation({ ...base, numGuests: 0 })).toBe(
            "At least 1 guest required"
        );
    });

    test("rejects guests exceeding capacity", () => {
        expect(validateReservation({ ...base, numGuests: 6 })).toBe(
            "Maximum 5 guests allowed"
        );
    });

    test("rejects when check-out before check-in", () => {
        expect(
            validateReservation({ ...base, startDate: "2026-06-05", endDate: "2026-06-01" })
        ).toBe("Check-out must be after check-in");
    });
});

describe("validateSignUp", () => {
    const base = {
        fullName: "John Doe",
        email: "john@example.com",
        password: "password123",
        policyAccepted: true,
    };

    test("valid signup passes", () => {
        expect(validateSignUp(base)).toBeNull();
    });

    test("rejects missing name", () => {
        expect(validateSignUp({ ...base, fullName: "" })).toBe(
            "All fields are required"
        );
    });

    test("rejects short password", () => {
        expect(validateSignUp({ ...base, password: "abc" })).toBe(
            "Password must be at least 8 characters"
        );
    });

    test("rejects without policy acceptance", () => {
        expect(validateSignUp({ ...base, policyAccepted: false })).toBe(
            "You must accept the privacy policy and terms"
        );
    });
});

describe("validateReview", () => {
    test("valid review passes", () => {
        expect(validateReview({ rating: 5, bookingId: 1 })).toBeNull();
    });

    test("rejects missing booking ID", () => {
        expect(validateReview({ rating: 3, bookingId: null })).toBe(
            "Missing booking ID"
        );
    });

    test("rejects invalid rating", () => {
        expect(validateReview({ rating: 0, bookingId: 1 })).toBe(
            "Rating must be 1-5"
        );
        expect(validateReview({ rating: 6, bookingId: 1 })).toBe(
            "Rating must be 1-5"
        );
    });
});
