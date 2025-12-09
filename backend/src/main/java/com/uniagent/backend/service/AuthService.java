// backend/src/main/java/com/uniagent/backend/service/AuthService.java
package com.uniagent.backend.service;

import com.uniagent.backend.dto.LoginRequest;
import com.uniagent.backend.dto.LoginResponse;
import com.uniagent.backend.dto.RegisterRequest;
import com.uniagent.backend.dto.RegisterResponse;
import com.uniagent.backend.model.SupabaseSignUpResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final SupabaseAuthClient supabaseAuthClient;
    private final SupabaseDatabaseClient supabaseDatabaseClient;

    public AuthService(SupabaseAuthClient supabaseAuthClient,
                       SupabaseDatabaseClient supabaseDatabaseClient) {
        this.supabaseAuthClient = supabaseAuthClient;
        this.supabaseDatabaseClient = supabaseDatabaseClient;
    }

    // -----------------------------------------------------
    // REGISTRIERUNG
    // -----------------------------------------------------
    public RegisterResponse register(RegisterRequest request) {
        try {
            // 1) User in Supabase Auth anlegen
            SupabaseSignUpResponse signUpResponse = supabaseAuthClient.signUp(
                    request.getEmail(),
                    request.getPassword(),
                    request.getFirstName(),
                    request.getLastName(),
                    "Anwender"              // feste Rolle für dich
            );

            if (signUpResponse == null || signUpResponse.getId() == null) {
                log.error("Supabase Signup hat keinen gültigen User zurückgegeben.");
                return new RegisterResponse(false, "Registrierung bei Supabase fehlgeschlagen.");
            }

            // 2) User in eigener Tabelle speichern
            try {
                supabaseDatabaseClient.insertUser(
                        signUpResponse.getId(),      // auth_user_id (String, wird in SQL zu UUID gecastet)
                        request.getFirstName(),
                        request.getLastName(),
                        "Anwender"
                );
            } catch (Exception e) {
                log.error("Fehler beim Speichern des Benutzers in der eigenen users-Tabelle", e);
                return new RegisterResponse(
                        false,
                        "Registrierung teilweise erfolgreich – interner Benutzer konnte nicht gespeichert werden."
                );
            }

            return new RegisterResponse(true, "Registrierung erfolgreich.");
        } catch (Exception e) {
            log.error("Technischer Fehler bei der Registrierung", e);
            return new RegisterResponse(false, "Technischer Fehler bei der Registrierung.");
        }
    }

    // -----------------------------------------------------
    // LOGIN
    // -----------------------------------------------------
    public LoginResponse login(LoginRequest request) {
        try {
            // 1) Login bei Supabase (Email + Passwort)
            Map<String, Object> loginResult =
                    supabaseAuthClient.login(request.getEmail(), request.getPassword());

            if (loginResult == null || !loginResult.containsKey("access_token")) {
                return new LoginResponse(
                        false,
                        "Login bei Supabase fehlgeschlagen. Bitte prüfe E-Mail und Passwort."
                );
            }

            String accessToken = (String) loginResult.get("access_token");

            @SuppressWarnings("unchecked")
            Map<String, Object> user = (Map<String, Object>) loginResult.get("user");
            if (user == null || user.get("id") == null) {
                log.error("Supabase Login ohne gültige user.id");
                return new LoginResponse(false, "Login fehlgeschlagen (keine Benutzer-ID gefunden).");
            }

            String authUserId = (String) user.get("id");

            // 2) Benutzer aus eigener users-Tabelle holen
            Optional<SupabaseDatabaseClient.UserRecord> userOpt =
                    supabaseDatabaseClient.findByAuthUserId(authUserId);

            if (userOpt.isEmpty()) {
                log.warn("Kein Eintrag in users-Tabelle für auth_user_id={}", authUserId);
                return new LoginResponse(false, "Benutzerprofil nicht gefunden.");
            }

            SupabaseDatabaseClient.UserRecord userRecord = userOpt.get();
            log.info("Login für {} {} (Rolle: {})",
                    userRecord.firstName(), userRecord.lastName(), userRecord.role());

            // 3) Erfolgsantwort – Token + Profil-Daten (Name + Email)
            return new LoginResponse(
                    true,
                    "Login erfolgreich.",
                    accessToken,
                    userRecord.firstName(),
                    userRecord.lastName(),
                    request.getEmail()
            );

        } catch (Exception e) {
            log.error("Technischer Fehler beim Login", e);
            return new LoginResponse(
                    false,
                    "Es ist ein technischer Fehler bei der Anmeldung aufgetreten. Bitte versuche es später erneut."
            );
        }
    }
}
