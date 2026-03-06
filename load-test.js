/**
 * k6 Load Testing Script for The Wild Oasis
 *
 * Tests:
 *  1. GET /cabins — Cabin listing page (public, SSR)
 *  2. POST /cabins/[id] — Reservation submission simulation
 *
 * Install k6: https://k6.io/docs/get-started/installation/
 * Run:
 *   k6 run load-test.js
 *   k6 run --vus 50 --duration 60s load-test.js
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

// ─── Custom metrics ────────────────────────────────────
const cabinsErrorRate = new Rate("cabins_errors");
const cabinsResponseTime = new Trend("cabins_response_time", true);
const reservationErrorRate = new Rate("reservation_errors");
const reservationResponseTime = new Trend("reservation_response_time", true);

// ─── Configuration ─────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// Cabin IDs to test against — adjust to match your Supabase data
const CABIN_IDS = [1, 2, 3, 4, 5, 6, 7, 8];

export const options = {
    // Ramp-up stages simulating realistic traffic growth
    stages: [
        { duration: "15s", target: 10 },   // Warm up: ramp to 10 users
        { duration: "30s", target: 25 },   // Normal load: 25 concurrent users
        { duration: "30s", target: 50 },   // Peak load: 50 concurrent users
        { duration: "15s", target: 100 },  // Stress test: 100 concurrent users
        { duration: "15s", target: 0 },    // Cool down
    ],
    thresholds: {
        // Page should load within 3s for 95% of requests
        cabins_response_time: ["p(95)<3000"],
        // Cabin listing error rate should stay below 5%
        cabins_errors: ["rate<0.05"],
        // Reservation endpoint should respond within 5s for 95%
        reservation_response_time: ["p(95)<5000"],
        // Reservation error rate should stay below 10%
        reservation_errors: ["rate<0.10"],
    },
};

// ─── Helpers ───────────────────────────────────────────
function randomCabinId() {
    return CABIN_IDS[Math.floor(Math.random() * CABIN_IDS.length)];
}

function futureDate(daysFromNow) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split("T")[0];
}

// ─── Main test scenario ────────────────────────────────
export default function () {
    // ── Scenario 1: Browse cabin listing page ──
    group("GET /cabins — Cabin listing", () => {
        const res = http.get(`${BASE_URL}/cabins`, {
            tags: { name: "CabinListing" },
        });

        cabinsResponseTime.add(res.timings.duration);
        cabinsErrorRate.add(res.status !== 200);

        check(res, {
            "cabins: status is 200": (r) => r.status === 200,
            "cabins: page contains cabin content": (r) =>
                r.body.includes("Our Luxury Cabins") || r.body.includes("cabin"),
            "cabins: response time < 2s": (r) => r.timings.duration < 2000,
        });
    });

    sleep(1); // Simulate user think time

    // ── Scenario 2: View a specific cabin detail ──
    group("GET /cabins/[id] — Cabin detail", () => {
        const cabinId = randomCabinId();
        const res = http.get(`${BASE_URL}/cabins/${cabinId}`, {
            tags: { name: "CabinDetail" },
        });

        check(res, {
            "cabin detail: status is 200": (r) => r.status === 200,
            "cabin detail: has reservation section": (r) =>
                r.body.includes("Reserve") || r.body.includes("reserve"),
            "cabin detail: response time < 3s": (r) => r.timings.duration < 3000,
        });
    });

    sleep(0.5);

    // ── Scenario 3: Simulate reservation submission ──
    // NOTE: This tests the Server Action endpoint. In production, Next.js
    // Server Actions require a valid CSRF token and auth session cookie.
    // This scenario tests the endpoint's ability to handle concurrent
    // POSTs without crashing — actual auth validation will reject them.
    group("POST /cabins — Reservation submission (stress)", () => {
        const cabinId = randomCabinId();
        const startDate = futureDate(30 + Math.floor(Math.random() * 60));
        const endDate = futureDate(33 + Math.floor(Math.random() * 60));

        const payload = JSON.stringify({
            cabinId: cabinId,
            startDate: startDate,
            endDate: endDate,
            numGuests: Math.floor(Math.random() * 4) + 1,
            observations: "k6 load test — ignore this booking",
            numNights: 3,
            cabinPrice: 750,
        });

        const params = {
            headers: {
                "Content-Type": "application/json",
                // Server actions require Next.js action header
                "Next-Action": "createReservation",
            },
            tags: { name: "ReservationSubmit" },
        };

        const res = http.post(`${BASE_URL}/cabins/${cabinId}`, payload, params);

        reservationResponseTime.add(res.timings.duration);
        // We expect 401/403 (no auth) or 200 — anything other than 5xx is acceptable
        const isServerError = res.status >= 500;
        reservationErrorRate.add(isServerError);

        check(res, {
            "reservation: no server error (5xx)": (r) => r.status < 500,
            "reservation: response time < 5s": (r) => r.timings.duration < 5000,
        });
    });

    sleep(1);

    // ── Scenario 4: Filter cabins by capacity ──
    group("GET /cabins?capacity=* — Filtered listing", () => {
        const filters = ["all", "small", "medium", "large"];
        const filter = filters[Math.floor(Math.random() * filters.length)];

        const res = http.get(`${BASE_URL}/cabins?capacity=${filter}`, {
            tags: { name: "CabinFiltered" },
        });

        check(res, {
            "filtered: status is 200": (r) => r.status === 200,
            "filtered: response time < 2.5s": (r) => r.timings.duration < 2500,
        });
    });

    sleep(0.5);
}

// ─── Summary output ────────────────────────────────────
export function handleSummary(data) {
    const summary = {
        timestamp: new Date().toISOString(),
        scenarios: {
            cabins_listing: {
                error_rate: data.metrics.cabins_errors
                    ? data.metrics.cabins_errors.values.rate
                    : "N/A",
                p95_response_ms: data.metrics.cabins_response_time
                    ? data.metrics.cabins_response_time.values["p(95)"]
                    : "N/A",
            },
            reservation_submit: {
                error_rate: data.metrics.reservation_errors
                    ? data.metrics.reservation_errors.values.rate
                    : "N/A",
                p95_response_ms: data.metrics.reservation_response_time
                    ? data.metrics.reservation_response_time.values["p(95)"]
                    : "N/A",
            },
        },
    };

    return {
        stdout: `\n${"=".repeat(60)}\nLOAD TEST SUMMARY\n${"=".repeat(60)}\n${JSON.stringify(summary, null, 2)}\n${"=".repeat(60)}\n`,
    };
}
