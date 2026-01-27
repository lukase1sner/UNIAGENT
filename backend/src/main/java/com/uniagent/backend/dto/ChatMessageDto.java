package com.uniagent.backend.dto;

public class ChatMessageDto {
    private String id;
    private String sender;
    private String content;
    private String createdAt;

    public ChatMessageDto() {}

    public ChatMessageDto(String id, String sender, String content, String createdAt) {
        this.id = id;
        this.sender = sender;
        this.content = content;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}