package com.uniagent.backend.dto;

public class AddMessageRequest {
    private String sender;  // "user" | "bot"
    private String content;

    public AddMessageRequest() {}

    public AddMessageRequest(String sender, String content) {
        this.sender = sender;
        this.content = content;
    }

    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}