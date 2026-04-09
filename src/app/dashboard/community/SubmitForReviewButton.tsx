import { submitLibraryForReview } from "@/app/actions/library";

export function SubmitForReviewButton({ itemId }: { itemId: string }) {
  async function submit() {
    "use server";
    await submitLibraryForReview(itemId);
  }

  return (
    <form action={submit} className="inline">
      <button type="submit" className="text-emerald-800 underline dark:text-emerald-300">
        Submit for review
      </button>
    </form>
  );
}
