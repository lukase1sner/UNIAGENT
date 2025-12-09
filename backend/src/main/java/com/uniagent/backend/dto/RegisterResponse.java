// backend/src/main/java/com/uniagent/backend/dto/RegisterResponse.java
package com.uniagent.backend.dto;

public class RegisterResponse {

    private boolean success;
    private String message;

    public RegisterResponse() {
    }

    public RegisterResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // Getter & Setter

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
