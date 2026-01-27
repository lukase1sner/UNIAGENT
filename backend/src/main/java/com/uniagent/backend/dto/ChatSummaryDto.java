package com.uniagent.backend.dto;

public class ChatSummaryDto {
    private String id;
    private String title;
    private String lastMessage;
    private String updatedAt;
    private String createdAt;

    public ChatSummaryDto() {}

    public ChatSummaryDto(String id, String title, String lastMessage, String updatedAt, String createdAt) {
        this.id = id;
        this.title = title;
        this.lastMessage = lastMessage;
        this.updatedAt = updatedAt;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}