-- Reviews must be rated 1 to 5 stars (BR-06). Zod checks it in the API; this protects the data itself.
ALTER TABLE "review" ADD CONSTRAINT "review_rating_check" CHECK ("rating" BETWEEN 1 AND 5);
