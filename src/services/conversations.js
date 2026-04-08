import api from "./api";

export async function getConversations() {
  const res = await api.get("/support/admin");
  return res.data;
}

export async function getConversationMessages(chatId) {
  const res = await api.get(`/support/messages/${chatId}`);
  return res.data;
}

export async function sendConversationMessage(chatId, text) {
  const res = await api.post("/support/admin/send", {
    chatId,
    text,
  });

  return res.data;
}