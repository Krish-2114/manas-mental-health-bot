import DistressBadge from "./DistressBadge";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[75%] bg-gradient-to-br from-manas-600 to-manas-500 text-white px-4 py-3 rounded-2xl rounded-br-md shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-manas-600 to-manas-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
        M
      </div>
      <div className="max-w-[75%]">
        <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
          <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        {message.distress_level && (
          <div className="mt-1.5 ml-1">
            <DistressBadge level={message.distress_level} />
          </div>
        )}
      </div>
    </div>
  );
}
