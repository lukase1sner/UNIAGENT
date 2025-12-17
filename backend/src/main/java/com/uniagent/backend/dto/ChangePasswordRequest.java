package com.uniagent.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ChangePasswordRequest {

    @NotBlank(message = "E-Mail darf nicht leer sein.")
    @Email(message = "Bitte eine gültige E-Mail-Adresse angeben.")
    private String email;

    @NotBlank(message = "Aktuelles Passwort darf nicht leer sein.")
    private String oldPassword;

    @NotBlank(message = "Neues Passwort darf nicht leer sein.")
    private String newPassword;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOldPassword() { return oldPassword; }
    public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
