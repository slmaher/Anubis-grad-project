const API_BASE_URL = "http://localhost:4000";

async function apiRequest(path, options = {}) {
  const { method = "GET", body, token } = options;

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login(email, password) {
    return apiRequest("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },
  register(name, email, password) {
    return apiRequest("/api/auth/register", {
      method: "POST",
      body: { name, email, password, role: "Visitor" },
    });
  },
  getMe(token) {
    return apiRequest("/api/users/me", { token });
  },

  // Museums
  getMuseums() {
    return apiRequest("/api/museums");
  },
  getMuseumById(id) {
    return apiRequest(`/api/museums/${id}`);
  },

  // Reviews
  getReviews(params = {}) {
    const query = new URLSearchParams();
    if (params.museumId) {
      query.append("museumId", params.museumId);
    }
    if (params.limit) {
      query.append("limit", String(params.limit));
    }
    const qs = query.toString();
    const suffix = qs ? `?${qs}` : "";
    return apiRequest(`/api/reviews${suffix}`);
  },
  createReview(payload, token) {
    return apiRequest("/api/reviews", {
      method: "POST",
      body: payload,
      token,
    });
  },

  // Posts
  getPosts(userId = null) {
    const url = userId ? `/api/posts?userId=${userId}` : "/api/posts";
    return apiRequest(url);
  },
  createPost(payload, token) {
    return apiRequest("/api/posts", {
      method: "POST",
      body: payload,
      token,
    });
  },
  togglePostLike(postId, token) {
    return apiRequest(`/api/posts/${postId}/like`, {
      method: "POST",
      token,
    });
  },
  addPostComment(postId, content, token) {
    return apiRequest(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: { content },
      token,
    });
  },

  // Chat
  getConversations(token) {
    return apiRequest("/api/chat/conversations", { token });
  },
  getMessages(conversationWith, token) {
    return apiRequest(
      `/api/chat/messages?conversationWith=${conversationWith}`,
      { token },
    );
  },
  sendMessage(receiverId, content, token) {
    return apiRequest("/api/chat/messages", {
      method: "POST",
      body: { receiver: receiverId, content },
      token,
    });
  },
  markConversationAsRead(userId, token) {
    return apiRequest(`/api/chat/conversations/${userId}/read-all`, {
      method: "PATCH",
      token,
    });
  },

  // Friends
  sendFriendRequest(receiverId, token) {
    return apiRequest("/api/friends/requests", {
      method: "POST",
      body: { receiverId },
      token,
    });
  },
  getIncomingFriendRequests(token) {
    return apiRequest("/api/friends/requests/incoming", { token });
  },
  acceptFriendRequest(requestId, token) {
    return apiRequest(`/api/friends/requests/${requestId}/accept`, {
      method: "POST",
      token,
    });
  },
  rejectFriendRequest(requestId, token) {
    return apiRequest(`/api/friends/requests/${requestId}/reject`, {
      method: "POST",
      token,
    });
  },
  getFriends(token) {
    return apiRequest("/api/friends", { token });
  },

  // Users
  getUserProfile(id, token) {
    return apiRequest(`/api/users/profile/${id}`, { token });
  },
  updateProfile(payload, token) {
    return apiRequest("/api/users/me", {
      method: "PATCH",
      body: payload,
      token,
    });
  },
};
