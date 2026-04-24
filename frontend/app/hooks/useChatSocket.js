import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getAuthToken } from "../api/authStorage";
import { API_BASE_URL } from "../api/baseUrl";

const SOCKET_URL = API_BASE_URL;

export const useChatSocket = (onNewMessage) => {
  const socketRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const initSocket = async () => {
      const token = await getAuthToken();
      if (!token || !isMounted) return;

      socketRef.current = io(SOCKET_URL, {
        auth: { token },
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      socketRef.current.on("new_message", (message) => {
        if (onNewMessage) {
          onNewMessage(message);
        }
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
      });
    };

    initSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [onNewMessage]);

  return socketRef.current;
};

export default function UseChatSocketRouteStub() {
  return null;
}
