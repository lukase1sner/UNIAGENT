package com.uniagent.backend.dto;

public class UpdateProfileResponse {

    private boolean success;
    private String message;

    private String firstName;
    private String lastName;
    private String email;

    public UpdateProfileResponse() {}

    public UpdateProfileResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public UpdateProfileResponse(
            boolean success,
            String message,
            String firstName,
            String lastName,
            String email
    ) {
        this.success = success;
        this.message = message;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }

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

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
