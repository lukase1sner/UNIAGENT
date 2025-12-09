package com.uniagent.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "E-Mail darf nicht leer sein.")
    @Email(message = "Bitte eine gültige E-Mail-Adresse angeben.")
    private String email;

    @NotBlank(message = "Passwort darf nicht leer sein.")
    private String password;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
