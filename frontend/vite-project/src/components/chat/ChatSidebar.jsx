import { getInitials, useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { APP_NAME, AppLogo } from "../AppLogo";
import { UserButton } from "@clerk/clerk-react";

import { SearchField, Tabs } from "@heroui/react";
import { BellIcon, MessageSquareIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { ConversationRow } from "./ConversationRow";

function mapUserForList(user, onlineUsers) {
  const displayName = user.fullName || user.fullname || user.username || "Unknown user";
  const username = user.username ? `@${user.username}` : "";

  return {
    conversationId: user._id,
    id: user._id,
    name: displayName,
    username,
    avatarUrl: user.profilePic,
    initials: getInitials(displayName),
    isOnline: onlineUsers.includes(user._id),
    peer: {
      name: displayName,
      avatarUrl: user.profilePic,
      initials: getInitials(displayName),
      isOnline: onlineUsers.includes(user._id),
    },
    relationStatus: user.relationStatus || "none",
  };
}

function getUserActionLabel(user) {
  if (user.relationStatus === "friends") return "Message";
  if (user.relationStatus === "incoming") return "Accept";
  if (user.relationStatus === "outgoing") return "Requested";
  return "Add";
}

function ChatSidebar() {
  const conversations = useChatStore((state) => state.conversations);
  const users = useChatStore((state) => state.users);
  const [showNotifications, setShowNotifications] = useState(false);

  const searchQuery = useChatStore((state) => state.searchQuery);
  const setSearchQuery = useChatStore((state) => state.setSearchQuery);

  const sidebarTab = useChatStore((state) => state.sidebarTab);
  const setSidebarTab = useChatStore((state) => state.setSidebarTab);

  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const sendFriendRequest = useChatStore((state) => state.sendFriendRequest);
  const acceptFriendRequest = useChatStore((state) => state.acceptFriendRequest);

  const onlineUsers = useAuthStore((state) => state.onlineUsers);

  const { activeConversationId, isLargeScreen } = useSelectedConversation();

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const conversationUsers = conversations.map((user) => mapUserForList(user, onlineUsers));
  const allUsers = users.map((user) => mapUserForList(user, onlineUsers));
  const friendContacts = allUsers.filter((user) => user.relationStatus === "friends");
  const incomingRequests = allUsers.filter((user) => user.relationStatus === "incoming");
  const chatContacts = normalizedSearchQuery
    ? friendContacts.filter((user) => `${user.name} ${user.username || ""}`.toLowerCase().includes(normalizedSearchQuery))
    : friendContacts;

  const filteredConversations = normalizedSearchQuery
    ? conversationUsers.filter((conversation) =>
        conversation.peer.name.toLowerCase().includes(normalizedSearchQuery),
      )
    : conversationUsers;

  const filteredUsers = normalizedSearchQuery
    ? allUsers.filter((user) => {
        const haystack = `${user.name} ${user.username || ""}`.toLowerCase();
        return haystack.includes(normalizedSearchQuery);
      })
    : allUsers;

  return (
    <aside
      className={`w-full shrink-0 flex-col overflow-hidden border-r border-border lg:w-72 ${
        !isLargeScreen && activeConversationId ? "hidden lg:flex" : "flex"
      }`}
    >
      <div className="shrink-0 border-b border-border px-2 pb-2 pt-2.5 sm:px-3 sm:pt-3">
        <div className="flex items-center gap-2 px-0.5 sm:gap-2.5 sm:px-1">
          <AppLogo size={32} className="size-8 shrink-0 rounded-[9px] sm:size-8.5" alt="" />
          <p className="flex-1 truncate text-lg font-bold tracking-tight sm:text-[22px]">
            {APP_NAME}
          </p>
          <button
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm"
            aria-label="Pending requests"
          >
            <BellIcon className="size-4" />
            {incomingRequests.length ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-danger-foreground">
                {incomingRequests.length}
              </span>
            ) : null}
          </button>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
        </div>
      </div>

      {showNotifications ? (
        <div className="border-b border-border bg-background px-3 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Friend requests</p>
            <button
              type="button"
              onClick={() => setShowNotifications(false)}
              className="text-xs text-muted hover:text-foreground"
            >
              Close
            </button>
          </div>
          {incomingRequests.length === 0 ? (
            <p className="text-xs text-muted">No pending requests right now.</p>
          ) : (
            incomingRequests.map((user) => (
              <div
                key={user.id}
                className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-border bg-accent-soft px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted">{user.username || "New request"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => acceptFriendRequest(user.id)}
                  className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                >
                  Accept
                </button>
              </div>
            ))
          )}
        </div>
      ) : null}

      <Tabs
        selectedKey={sidebarTab}
        onSelectionChange={(key) => setSidebarTab(String(key))}
        variant="secondary"
        className="flex flex-1 flex-col overflow-y-auto"
      >
        <div className="shrink-0 border-b border-border px-3 pb-2 pt-2">
          <SearchField
            fullWidth
            variant="secondary"
            className="w-full"
            value={searchQuery}
            onChange={setSearchQuery}
          >
            <SearchField.Group className="rounded-xl">
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search" />
              {searchQuery ? <SearchField.ClearButton /> : null}
            </SearchField.Group>
          </SearchField>
        </div>

        <Tabs.ListContainer className="shrink-0 border-b border-border px-2 pb-2 pt-1">
          <Tabs.List className="w-full gap-0.5">
            <Tabs.Tab id="chats" className="flex-1 justify-center gap-1.5">
              <MessageSquareIcon className="size-3.5 opacity-80" aria-hidden />
              Chats
            </Tabs.Tab>
            <Tabs.Tab id="users" className="flex-1 justify-center gap-1.5">
              <UsersIcon className="size-3.5 opacity-80" aria-hidden />
              Users
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel
          id="chats"
          className="flex-1 overflow-x-hidden overflow-y-auto outline-none"
        >
          {chatContacts.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">No accepted chats yet.</p>
          ) : (
            chatContacts.map((contact) => (
              <ConversationRow
                key={contact.id}
                user={contact}
                selected={contact.id === activeConversationId}
                onSelect={() => setActiveConversationId(contact.id)}
              />
            ))
          )}
        </Tabs.Panel>

        <Tabs.Panel id="users" className="flex-1 overflow-x-hidden overflow-y-auto outline-none">
          {filteredUsers.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">No people match your search.</p>
          ) : (
            filteredUsers.map((user) => (
              <ConversationRow
                key={user.conversationId}
                user={user}
                selected={user.conversationId === activeConversationId}
                onSelect={() => {
                  if (user.relationStatus === "friends") {
                    setActiveConversationId(user.conversationId);
                  }
                }}
                onRequest={user.relationStatus === "none" ? () => sendFriendRequest(user.id) : undefined}
                onAccept={user.relationStatus === "incoming" ? () => acceptFriendRequest(user.id) : undefined}
                actionLabel={getUserActionLabel(user)}
              />
            ))
          )}
        </Tabs.Panel>
      </Tabs>
    </aside>
  );
}
export default ChatSidebar;