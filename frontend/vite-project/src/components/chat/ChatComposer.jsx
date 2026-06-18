import { Button, TextArea } from "@heroui/react";
import { ImageIcon, LoaderIcon, MicIcon, SendHorizontalIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useKeyboardSound from "../../hooks/useKeyboardSound";
import { useChatStore } from "../../store/useChatStore";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useAuthStore } from "../../store/useAuthStore";

export function ChatComposer() {
  const composerText = useChatStore((state) => state.composerText);
  const isSoundEnabled = useChatStore((state) => state.isSoundEnabled);
  const sendMediaMessage = useChatStore((state) => state.sendMediaMessage);
  const isSendingMedia = useChatStore((state) => state.isSendingMedia);
  const sendTextMessage = useChatStore((state) => state.sendTextMessage);
  const setComposerText = useChatStore((state) => state.setComposerText);
  const { activeConversationId } = useSelectedConversation();
  const authUser = useAuthStore((state) => state.authUser);
  const socket = useAuthStore((state) => state.socket);
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const mediaInputRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingStartedAtRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const typingStateRef = useRef(false);
  const typingStopTimerRef = useRef(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const playSoundIfEnabled = () => {
    if (isSoundEnabled) playRandomKeyStrokeSound();
  };

  const emitTypingStatus = (isTyping) => {
    if (!socket || !activeConversationId || !authUser?._id) return;

    socket.emit("typingStatus", {
      senderId: authUser._id,
      receiverId: activeConversationId,
      isTyping,
    });
    typingStateRef.current = isTyping;
  };

  const stopTyping = () => {
    if (typingStopTimerRef.current) {
      window.clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }

    if (typingStateRef.current) {
      emitTypingStatus(false);
    }
  };

  useEffect(() => {
    return () => stopTyping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId, socket, authUser?._id]);

  const handleSend = async () => {
    stopTyping();
    const didSendMessage = await sendTextMessage(activeConversationId);
    if (didSendMessage) playSoundIfEnabled();
  };

  const handleComposerTextChange = (event) => {
    const nextValue = event.target.value;
    setComposerText(nextValue);
    playSoundIfEnabled();

    if (!socket || !activeConversationId || !authUser?._id) return;

    const nextIsTyping = nextValue.trim().length > 0;

    if (nextIsTyping && !typingStateRef.current) {
      emitTypingStatus(true);
    }

    if (!nextIsTyping) {
      stopTyping();
      return;
    }

    if (typingStopTimerRef.current) {
      window.clearTimeout(typingStopTimerRef.current);
    }

    typingStopTimerRef.current = window.setTimeout(() => {
      stopTyping();
    }, 1600);
  };

  const handleMediaPick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const didSendMessage = await sendMediaMessage({
      conversationId: activeConversationId,
      file,
    });

    if (didSendMessage) playSoundIfEnabled();
  };

  const stopMediaStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const clearRecordingTimer = () => {
    if (recordingIntervalRef.current) {
      window.clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  const stopVoiceRecording = async () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
  };

  const startVoiceRecording = async () => {
    if (isSendingMedia || isRecordingVoice) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType =
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "";

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      recordingStartedAtRef.current = Date.now();
      setRecordingDuration(0);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const type = chunksRef.current[0]?.type || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        stopMediaStream();
        clearRecordingTimer();
        setIsRecordingVoice(false);

        if (!blob.size) return;

        const extension = type.includes("mp4") ? "m4a" : "webm";
        const file = new File([blob], `voice-note-${Date.now()}.${extension}`, { type });

        const didSendMessage = await sendMediaMessage({
          conversationId: activeConversationId,
          file,
          audioDuration: Math.max(1, recordingDuration || Math.ceil((Date.now() - (recordingStartedAtRef.current || Date.now())) / 1000)),
        });

        if (didSendMessage) playSoundIfEnabled();
      };

      recorder.start();
      setIsRecordingVoice(true);
      clearRecordingTimer();
      recordingIntervalRef.current = window.setInterval(() => {
        const startedAt = recordingStartedAtRef.current || Date.now();
        setRecordingDuration(Math.max(1, Math.ceil((Date.now() - startedAt) / 1000)));
      }, 1000);
    } catch (error) {
      stopMediaStream();
      setIsRecordingVoice(false);
      console.error("Failed to start voice recording:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
      stopMediaStream();
      clearRecordingTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVoicePressStart = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (isRecordingVoice) return;
    event.preventDefault();
    startVoiceRecording();
  };

  const handleVoicePressEnd = () => {
    if (!isRecordingVoice) return;
    stopVoiceRecording();
  };

  const formatDuration = (seconds) => {
    const value = Math.max(0, seconds);
    return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  };

  const waveformBars = [18, 32, 22, 40, 26, 16];

  return (
    <footer className="shrink-0 border-t border-border px-1.5 pb-2 pt-2 sm:px-2">
      {isRecordingVoice ? (
        <div className="mx-auto mb-2 flex max-w-full items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-danger animate-pulse" />
            <span className="truncate font-medium">Recording voice note</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="tabular-nums text-xs font-semibold">{formatDuration(recordingDuration)}</span>
            <span className="flex items-end gap-1">
              {waveformBars.map((height, index) => (
                <span
                  key={height + index}
                  className="w-1 rounded-full bg-danger/80 animate-pulse"
                  style={{
                    height: `${height / 3}px`,
                    animationDelay: `${index * 120}ms`,
                  }}
                />
              ))}
            </span>
          </div>
        </div>
      ) : null}
      {isSendingMedia ? (
        <div className="mx-auto mb-2 flex max-w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted">
          <LoaderIcon
            className="size-4 shrink-0 animate-spin text-accent"
            strokeWidth={2}
            aria-hidden
          />
          <span className="truncate">Uploading media...</span>
        </div>
      ) : null}
      <div className="mx-auto flex w-full max-w-full items-end gap-1.5 px-0.5 sm:gap-2 sm:px-1">
        <input
          ref={mediaInputRef}
          type="file"
          accept="image/*,video/*"
          className="sr-only"
          disabled={isSendingMedia}
          tabIndex={-1}
          aria-hidden
          onChange={handleMediaPick}
        />
        <Button
          variant="ghost"
          isIconOnly
          isDisabled={isSendingMedia}
          className="size-9 shrink-0 touch-manipulation self-end text-accent"
          onPress={() => mediaInputRef.current?.click()}
        >
          <ImageIcon className="size-5 sm:size-6" strokeWidth={2} />
        </Button>
        <button
          type="button"
          className={`grid size-9 shrink-0 place-items-center rounded-full border transition ${
            isRecordingVoice
              ? "border-danger bg-danger text-danger-foreground shadow-sm"
              : "border-border bg-background text-accent"
          }`}
          aria-label="Hold to record voice note"
          disabled={isSendingMedia}
          onPointerDown={handleVoicePressStart}
          onPointerUp={handleVoicePressEnd}
          onPointerLeave={handleVoicePressEnd}
          onPointerCancel={handleVoicePressEnd}
        >
          <MicIcon className={`size-5 sm:size-6 ${isRecordingVoice ? "animate-pulse" : ""}`} strokeWidth={2} />
        </button>
        <TextArea
          fullWidth
          variant="secondary"
          placeholder="Message"
          rows={1}
          value={composerText}
          onChange={handleComposerTextChange}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 rounded-full"
        />

        <Button
          variant="primary"
          isIconOnly
          isDisabled={!composerText.trim()}
          onPress={handleSend}
        >
          <SendHorizontalIcon className="size-5" />
        </Button>
      </div>
    </footer>
  );
}
