"use client";

import { useState } from "react";
import StarRating from "./StarRating";
import { createReview } from "../_lib/action";

function ReviewForm({ cabinId, bookingId }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.set("cabinId", cabinId);
            formData.set("bookingId", bookingId);
            formData.set("rating", rating);
            formData.set("comment", comment);

            await createReview(formData);
            setSubmitted(true);
        } catch (error) {
            console.error("Failed to submit review:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (submitted) {
        return (
            <div className="bg-primary-800/50 p-6 rounded-sm border border-primary-700 text-center">
                <p className="text-accent-400 font-semibold text-lg">
                    Thank you for your review! ⭐
                </p>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-primary-800/30 p-6 rounded-sm border border-primary-800 space-y-4"
        >
            <h4 className="text-primary-100 font-semibold text-lg">
                Leave a review
            </h4>

            <div className="space-y-2">
                <label className="text-primary-300 text-sm">Your rating</label>
                <StarRating onSetRating={setRating} defaultRating={rating} />
                {rating === 0 && (
                    <p className="text-primary-500 text-xs">Click the stars to rate</p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="comment" className="text-primary-300 text-sm">
                    Your comment (optional)
                </label>
                <textarea
                    name="comment"
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="px-4 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm text-base"
                    rows={3}
                />
            </div>

            <button
                type="submit"
                disabled={rating === 0 || isSubmitting}
                className="bg-accent-500 px-6 py-3 text-primary-800 font-semibold hover:bg-accent-600 transition-all disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300 text-base"
            >
                {isSubmitting ? "Submitting..." : "Submit review"}
            </button>
        </form>
    );
}

export default ReviewForm;
