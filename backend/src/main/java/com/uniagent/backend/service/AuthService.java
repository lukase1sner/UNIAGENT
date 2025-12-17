package com.uniagent.backend.service;

import com.uniagent.backend.dto.LoginRequest;
import com.uniagent.backend.dto.LoginResponse;
import com.uniagent.backend.dto.RegisterRequest;
import com.uniagent.backend.dto.RegisterResponse;
import com.uniagent.backend.dto.ChangePasswordRequest;
import com.uniagent.backend.dto.ChangePasswordResponse;
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

    public AuthService(
            SupabaseAuthClient supabaseAuthClient,
            SupabaseDatabaseClient supabaseDatabaseClient
    ) {
        this.supabaseAuthClient = supabaseAuthClient;
        this.supabaseDatabaseClient = supabaseDatabaseClient;
    }

    // -----------------------------------------------------
    // REGISTRIERUNG
    // -----------------------------------------------------
    public RegisterResponse register(RegisterRequest request) {
        try {
            SupabaseSignUpResponse signUpResponse = supabaseAuthClient.signUp(
                    request.getEmail(),
                    request.getPassword(),
                    request.getFirstName(),
                    request.getLastName(),
                    "Anwender"
            );

            if (signUpResponse == null || signUpResponse.getId() == null) {
                log.error("Supabase Signup hat keinen gültigen User zurückgegeben.");
                return new RegisterResponse(false, "Registrierung bei Supabase fehlgeschlagen.");
            }

            try {
                supabaseDatabaseClient.insertUser(
                        signUpResponse.getId(),
                        request.getFirstName(),
                        request.getLastName(),
                        "Anwender"
                );
            } catch (Exception e) {
                log.error("Fehler beim Speichern des Benutzers in der users-Tabelle", e);
                return new RegisterResponse(
                        false,
                        "Registrierung teilweise erfolgreich – Benutzerprofil konnte nicht gespeichert werden."
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
            Map<String, Object> loginResult =
                    supabaseAuthClient.login(request.getEmail(), request.getPassword());

            if (loginResult == null || !loginResult.containsKey("access_token")) {
                return new LoginResponse(
                        false,
                        "Login fehlgeschlagen. Bitte prüfe E-Mail und Passwort."
                );
            }

            String accessToken = (String) loginResult.get("access_token");

            @SuppressWarnings("unchecked")
            Map<String, Object> user = (Map<String, Object>) loginResult.get("user");
            if (user == null || user.get("id") == null) {
                log.error("Supabase Login ohne gültige user.id");
                return new LoginResponse(false, "Login fehlgeschlagen (keine Benutzer-ID).");
            }

            String authUserId = (String) user.get("id");

            Optional<SupabaseDatabaseClient.UserRecord> userOpt =
                    supabaseDatabaseClient.findByAuthUserId(authUserId);

            if (userOpt.isEmpty()) {
                log.warn("Kein Eintrag in users-Tabelle für auth_user_id={}", authUserId);
                return new LoginResponse(false, "Benutzerprofil nicht gefunden.");
            }

            SupabaseDatabaseClient.UserRecord userRecord = userOpt.get();

<<<<<<< HEAD
            log.info("Login für {} {} (Rolle: {})",
                    userRecord.firstName(),
                    userRecord.lastName(),
                    userRecord.role());

            // 👇 HIER ist die entscheidende Stelle
=======
            log.info(
                    "Login für {} {} (Rolle: {})",
                    userRecord.firstName(),
                    userRecord.lastName(),
                    userRecord.role()
            );

>>>>>>> 01c5205 (Passwort ändern)
            return new LoginResponse(
                    true,
                    "Login erfolgreich.",
                    accessToken,
                    userRecord.firstName(),
                    userRecord.lastName(),
                    request.getEmail(),
                    userRecord.role()
            );

        } catch (Exception e) {
            log.error("Technischer Fehler beim Login", e);
            return new LoginResponse(
                    false,
                    "Technischer Fehler bei der Anmeldung."
            );
        }
    }

    // -----------------------------------------------------
    // PASSWORT ÄNDERN
    // -----------------------------------------------------
    public ChangePasswordResponse changePassword(ChangePasswordRequest request) {
        try {
            // 1) Altes Passwort prüfen (Re-Login)
            Map<String, Object> loginResult =
                    supabaseAuthClient.login(
                            request.getEmail(),
                            request.getOldPassword()
                    );

            if (loginResult == null || !loginResult.containsKey("access_token")) {
                return new ChangePasswordResponse(
                        false,
                        "Aktuelles Passwort ist falsch."
                );
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> user = (Map<String, Object>) loginResult.get("user");
            if (user == null || user.get("id") == null) {
                return new ChangePasswordResponse(
                        false,
                        "Benutzer konnte nicht ermittelt werden."
                );
            }

            String authUserId = (String) user.get("id");

            // 2) Neues Passwort setzen (Supabase Admin)
            boolean updated =
                    supabaseAuthClient.updatePasswordAdmin(
                            authUserId,
                            request.getNewPassword()
                    );

            if (!updated) {
                return new ChangePasswordResponse(
                        false,
                        "Passwort konnte nicht geändert werden."
                );
            }

            return new ChangePasswordResponse(
                    true,
                    "Passwort erfolgreich geändert."
            );

        } catch (Exception e) {
            log.error("Technischer Fehler beim Passwort ändern", e);
            return new ChangePasswordResponse(
                    false,
                    "Technischer Fehler beim Passwort ändern."
            );
        }
    }
}