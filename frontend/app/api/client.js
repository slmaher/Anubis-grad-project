const API_BASE_URL = "http://localhost:4000";
const MONGODB_OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;

const LEGACY_MUSEUM_ALIASES = {
  1: ["grand egyptian museum", "the grand egyptian museum"],
  2: ["egyptian museum", "the egyptian museum"],
  "grand egyptian museum": [
    "grand egyptian museum",
    "the grand egyptian museum",
  ],
  "egyptian museum": ["egyptian museum", "the egyptian museum"],
  "museum of islamic art": [
    "museum of islamic art, cairo",
    "museum of islamic art",
  ],
  "coptic museum": ["coptic museum"],
  "national museum of egyptian civilization": [
    "national museum of egyptian civilization",
    "the national museum of egypt",
    "the national museum of egyptian civilization",
  ],
};

function normalizeMuseumName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expandMuseumCandidates(values) {
  const expanded = new Set();

  values.forEach((value) => {
    const normalized = normalizeMuseumName(value);
    if (!normalized) {
      return;
    }

    expanded.add(normalized);
    const aliases = LEGACY_MUSEUM_ALIASES[normalized];
    if (aliases) {
      aliases.forEach((alias) => expanded.add(normalizeMuseumName(alias)));
    }
  });

  return [...expanded];
}

async function resolveMuseumId({ museumId, museumLookupName, museumName }) {
  const rawMuseumId = museumId == null ? "" : String(museumId).trim();

  if (rawMuseumId && MONGODB_OBJECT_ID_PATTERN.test(rawMuseumId)) {
    return rawMuseumId;
  }

  const candidateNames = expandMuseumCandidates([
    museumLookupName,
    museumName,
    rawMuseumId,
  ]);

  if (candidateNames.length === 0) {
    return null;
  }

  const response = await apiRequest("/api/museums");
  const museums = response?.data || [];

  const match = museums.find((museum) => {
    const museumNameValue = normalizeMuseumName(museum?.name);
    return candidateNames.some((candidate) => candidate === museumNameValue);
  });

  return match?._id || match?.id || null;
}

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
    const museumFilter =
      params.museumId || params.museumLookupName || params.museumName;

    if (!museumFilter) {
      if (params.limit) {
        query.append("limit", String(params.limit));
      }
      const qs = query.toString();
      const suffix = qs ? `?${qs}` : "";
      return apiRequest(`/api/reviews${suffix}`);
    }

    return resolveMuseumId(params).then((resolvedMuseumId) => {
      if (!resolvedMuseumId) {
        throw new Error("Unable to resolve the selected museum.");
      }

      query.append("museumId", resolvedMuseumId);
      if (params.limit) {
        query.append("limit", String(params.limit));
      }
      const qs = query.toString();
      const suffix = qs ? `?${qs}` : "";
      return apiRequest(`/api/reviews${suffix}`);
    });
  },
  createReview(payload, token) {
    return resolveMuseumId({
      museumId: payload?.museum,
      museumLookupName: payload?.museumLookupName,
      museumName: payload?.museumName,
    }).then((resolvedMuseumId) => {
      if (!resolvedMuseumId) {
        throw new Error("Unable to resolve the selected museum.");
      }

      return apiRequest("/api/reviews", {
        method: "POST",
        body: {
          museum: resolvedMuseumId,
          rating: payload.rating,
          comment: payload.comment,
        },
        token,
      });
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
  getAiChatReply(history, language) {
    return apiRequest("/api/assistant/chat", {
      method: "POST",
      body: { history, language },
    });
  },
  async translateTextMyMemory(text, targetLang, sourceLang = "en") {
    const langCodePattern = /^[a-z]{2}(?:-[a-z]{2})?$/i;
    const normalizedSource = langCodePattern.test(String(sourceLang || ""))
      ? String(sourceLang)
      : "en";
    const normalizedTarget = langCodePattern.test(String(targetLang || ""))
      ? String(targetLang)
      : "en";

    const makeRequest = async (fromLang) => {
      const query = new URLSearchParams({
        q: text,
        langpair: `${fromLang}|${normalizedTarget}`,
      });

      const response = await fetch(
        `https://api.mymemory.translated.net/get?${query.toString()}`,
      );

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const message =
          (data && (data.responseDetails || data.message)) ||
          `MyMemory request failed with status ${response.status}`;
        throw new Error(message);
      }

      const translatedText = data?.responseData?.translatedText;
      if (!translatedText || typeof translatedText !== "string") {
        throw new Error("MyMemory did not return translated text.");
      }

      return {
        success: true,
        data: {
          translatedText,
          match: data?.responseData?.match,
        },
      };
    };

    try {
      return await makeRequest(normalizedSource);
    } catch (error) {
      const shouldRetryWithEnglish =
        normalizedSource.toLowerCase() !== "en" &&
        /source language|langpair|invalid/i.test(String(error?.message || ""));

      if (shouldRetryWithEnglish) {
        return makeRequest("en");
      }
      throw error;
    }
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

  // Events
  getEvents(params = {}) {
    const query = new URLSearchParams();

    if (params.museumId) {
      query.append("museumId", String(params.museumId));
    }

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest(`/api/events${suffix}`);
  },

  // Volunteering screen APIs
  getVolunteerOpportunities() {
    return apiRequest("/api/volunteers/opportunities");
  },
  signUpVolunteerOpportunity(opportunityId, payload = {}) {
    return apiRequest(`/api/volunteers/opportunities/${opportunityId}/signup`, {
      method: "POST",
      body: payload,
    });
  },

  // Donation screen APIs
  getDonationCampaigns() {
    return apiRequest("/api/donations/campaigns");
  },
  contributeDonationCampaign(campaignId, payload = {}) {
    return apiRequest(`/api/donations/campaigns/${campaignId}/contribute`, {
      method: "POST",
      body: payload,
    });
  },

  // --- ADMIN APIs ---
  admin: {
    // Users
    getUsers(token) {
      return apiRequest("/api/users", { token });
    },
    updateUserRole(userId, role, token) {
      return apiRequest(`/api/users/${userId}/role`, {
        method: "PATCH",
        body: { role },
        token,
      });
    },
    deleteUser(userId, token) {
      return apiRequest(`/api/users/${userId}`, {
        method: "DELETE",
        token,
      });
    },

    // Museums
    createMuseum(payload, token) {
      return apiRequest("/api/museums", {
        method: "POST",
        body: payload,
        token,
      });
    },
    deleteMuseum(id, token) {
      return apiRequest(`/api/museums/${id}`, {
        method: "DELETE",
        token,
      });
    },

    // Artifacts
    getArtifacts(token) {
      return apiRequest("/api/artifacts", { token });
    },
    createArtifact(payload, token) {
      return apiRequest("/api/artifacts", {
        method: "POST",
        body: payload,
        token,
      });
    },
    deleteArtifact(id, token) {
      return apiRequest(`/api/artifacts/${id}`, {
        method: "DELETE",
        token,
      });
    },

    // Marketplace
    getMarketplace(token) {
      return apiRequest("/api/marketplace", { token });
    },
    createProduct(payload, token) {
      return apiRequest("/api/marketplace", {
        method: "POST",
        body: payload,
        token,
      });
    },
    updateProduct(id, payload, token) {
      return apiRequest(`/api/marketplace/${id}`, {
        method: "PATCH",
        body: payload,
        token,
      });
    },
    deleteProduct(id, token) {
      return apiRequest(`/api/marketplace/${id}`, {
        method: "DELETE",
        token,
      });
    },

    // Volunteering
    createOpportunity(payload, token) {
      return apiRequest("/api/volunteers/opportunities", {
        method: "POST",
        body: payload,
        token,
      });
    },
    updateOpportunity(id, payload, token) {
      return apiRequest(`/api/volunteers/opportunities/${id}`, {
        method: "PATCH",
        body: payload,
        token,
      });
    },
    deleteOpportunity(id, token) {
      return apiRequest(`/api/volunteers/opportunities/${id}`, {
        method: "DELETE",
        token,
      });
    },
    getApplications(token) {
      return apiRequest("/api/volunteers", { token });
    },
    updateApplicationStatus(id, status, token) {
      return apiRequest(`/api/volunteers/${id}`, {
        method: "PATCH",
        body: { status },
        token,
      });
    },

    // Posts
    deletePost(id, token) {
      return apiRequest(`/api/posts/${id}`, {
        method: "DELETE",
        token,
      });
    },

    // Reviews
    deleteReview(id, token) {
      return apiRequest(`/api/reviews/${id}`, {
        method: "DELETE",
        token,
      });
    },
  },
};
