package com.uniagent.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Vorname darf nicht leer sein.")
    @Size(min = 2, message = "Vorname muss mindestens 2 Zeichen lang sein.")
    private String firstName;

    @NotBlank(message = "Nachname darf nicht leer sein.")
    @Size(min = 2, message = "Nachname muss mindestens 2 Zeichen lang sein.")
    private String lastName;

    @NotBlank(message = "E-Mail darf nicht leer sein.")
    @Email(message = "Bitte gib eine gültige E-Mail-Adresse ein.")
    private String email;

    @NotBlank(message = "Passwort darf nicht leer sein.")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).{8,}$",
            message = "Passwort muss mindestens 8 Zeichen lang sein und mindestens einen Großbuchstaben, eine Zahl und ein Sonderzeichen enthalten."
    )
    private String password;

    // === Getter & Setter ===

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}