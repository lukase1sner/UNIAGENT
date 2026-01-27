package com.uniagent.backend.dto;

public class CreateChatResponse {
    private boolean success;
    private String message;
    private String chatId;
    private String title;

    public CreateChatResponse() {}

    public CreateChatResponse(boolean success, String message, String chatId, String title) {
        this.success = success;
        this.message = message;
        this.chatId = chatId;
        this.title = title;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getChatId() { return chatId; }
    public void setChatId(String chatId) { this.chatId = chatId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}