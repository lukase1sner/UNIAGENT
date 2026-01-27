package com.uniagent.backend.dto;

public class CreateChatRequest {
    private String title;

    public CreateChatRequest() {}

    public CreateChatRequest(String title) {
        this.title = title;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}