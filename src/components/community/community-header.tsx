/**
 * Community Header Component
 *
 * Displays the main header for the community section with title and description.
 */
export function CommunityHeader() {
  return (
    <div className="mb-8">
      <h1 className="font-heading text-4xl font-bold text-green-950 mb-2">
        Community
      </h1>
      <p className="text-gray-600 text-lg max-w-2xl">
        Connect with fellow turtle enthusiasts, share your experiences, and learn from the community.
        Join discussions, ask questions, and help others on their turtle journey.
      </p>
    </div>
  );
}
