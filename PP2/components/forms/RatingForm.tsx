// components/RatingForm.tsx
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/outline";

interface RatingFormProps {
  upvoteCount: number;
  downvoteCount: number;
  userVote: "upvote" | "downvote" | null; // user's previous vote (null if not voted)
  onVoteChange: (votedYet: boolean, newVote: "upvote" | "downvote") => void; // function to update the vote
}

const RatingForm: React.FC<RatingFormProps> = ({
  upvoteCount,
  downvoteCount,
  userVote,
  onVoteChange,
}) => {
  // Function to handle click on the thumbs up button
  const handleUpvote = () => {
    if (userVote === "upvote") return; // Do nothing if already voted for upvote
    onVoteChange(userVote !== null, "upvote");
  };

  // Function to handle click on the thumbs down button
  const handleDownvote = () => {
    if (userVote === "downvote") return; // Do nothing if already voted for downvote
    onVoteChange(userVote !== null, "downvote");
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Upvote Button */}
      <div
        onClick={handleUpvote}
        className={`flex items-center space-x-1 cursor-pointer ${userVote === "upvote" ? "text-blue-500" : "text-gray-500"}`}
      >
        <HandThumbUpIcon className="h-5 w-5" />
        <span>{upvoteCount}</span>
      </div>

      {/* Downvote Button */}
      <div
        onClick={handleDownvote}
        className={`flex items-center space-x-1 cursor-pointer ${userVote === "downvote" ? "text-red-500" : "text-gray-500"}`}
      >
        <HandThumbDownIcon className="h-5 w-5" />
        <span>{downvoteCount}</span>
      </div>
    </div>
  );
};

export default RatingForm;
