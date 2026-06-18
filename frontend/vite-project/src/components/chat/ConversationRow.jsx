import { Avatar } from "@heroui/react";
import { AvatarWithOnlineIndicator } from "./AvatarWithOnlineIndicator";

export function ConversationRow({ user, selected, onSelect, onRequest, onAccept, actionLabel }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.();
        }
      }}
      className={`flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left ${
        selected ? "bg-accent-soft" : ""
      }`}
    >
      <AvatarWithOnlineIndicator isOnline={user.isOnline ?? true}>
        <Avatar className="size-12 shrink-0">
          <Avatar.Image alt={user.name} src={user.avatarUrl} />
          <Avatar.Fallback className="text-sm font-medium">{user.initials}</Avatar.Fallback>
        </Avatar>
      </AvatarWithOnlineIndicator>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{user.name}</p>
        {user.username ? <p className="text-xs text-muted">{user.username}</p> : null}
        {actionLabel ? <p className="text-xs text-muted">{actionLabel}</p> : null}
      </div>

      {onRequest || onAccept ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (onAccept) onAccept();
            else if (onRequest) onRequest();
          }}
          className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}