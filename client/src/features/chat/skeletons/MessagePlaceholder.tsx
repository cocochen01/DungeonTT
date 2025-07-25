const MessagePlaceholder = ({ isOwnMessage }: { isOwnMessage: boolean }) => {
  return (
    <div className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}>
      <div className="chat-image avatar">
        <div className="size-10 rounded-full">
          <div className="skeleton w-full h-full rounded-full" />
        </div>
      </div>

      <div className="chat-header mb-1">
        <div className="skeleton h-4 w-16" />
      </div>

      <div className="chat-bubble bg-transparent p-0">
        <div className="skeleton h-16 w-[200px]" />
      </div>
    </div>
  );
};

export default MessagePlaceholder;