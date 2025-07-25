import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import MessageInput from "./MessageInput";
import { useAuthStore } from "../../store/useAuthStore";
import MessagePlaceholder from "./skeletons/MessagePlaceholder";
import { formatMessageTime } from "../../lib/utils";
//import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  //chat messages
  const { messages, getMessages, isMessagesLoading, currentGameroom } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (currentGameroom?._id)
    getMessages(currentGameroom._id);
  }, [currentGameroom?._id, getMessages]);
  
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // if (isMessagesLoading) {
  //   return (
  //     <div className="flex-1 flex flex-col overflow-auto">
  //       <MessageSkeleton />
  //       <MessageInput />
  //     </div>
  //   );
  // }
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <MessagePlaceholder isOwnMessage={true} />
        <MessageInput />
      </div>
    );
  }
  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
        {messages.map((message) =>
          message.sender ? (
            <div
              key={message._id}
              className={`chat ${message.sender._id === authUser?._id ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={message.sender.profilePic || "/avatar.png"}
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col max-w-full break-all">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="rounded-md mb-2 max-w-full"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
              <div className="chat-footer mb-1 text-blue-500 font-bold">
                {message.sender.username}
              </div>
            </div>
          ) : null
        )}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};
export default ChatContainer;