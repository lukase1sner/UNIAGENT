// backend/src/main/java/com/uniagent/backend/service/SupabaseAuthClient.java
package com.uniagent.backend.service;

import com.uniagent.backend.config.SupabaseConfig;
import com.uniagent.backend.model.SupabaseSignUpResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class SupabaseAuthClient {

    private final String supabaseUrl;
    private final String anonKey;
    private final String serviceRoleKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public SupabaseAuthClient(SupabaseConfig config) {
        this.supabaseUrl = config.getProjectUrl();
        this.anonKey = config.getAnonKey();
        this.serviceRoleKey = config.getServiceRoleKey(); // wichtig für Admin-Calls
    }

    // --------------------------------------------------------------
    // SIGNUP (Registrierung) – erstellt User per Admin-Endpoint
    // → email_confirm = true => kein "Waiting for verification"
    // --------------------------------------------------------------
    public SupabaseSignUpResponse signUp(
            String email,
            String password,
            String firstName,
            String lastName,
            String role
    ) {
        try {
            String url = supabaseUrl + "/auth/v1/admin/users";

            Map<String, Object> body = Map.of(
                    "email", email,
                    "password", password,
                    "email_confirm", true,
                    "user_metadata", Map.of(
                            "first_name", firstName,
                            "last_name", lastName,
                            "role", role
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", serviceRoleKey);
            headers.set("Authorization", "Bearer " + serviceRoleKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<SupabaseSignUpResponse> response =
                    restTemplate.exchange(url, HttpMethod.POST, request, SupabaseSignUpResponse.class);

            log.info("Supabase Signup Status: {}", response.getStatusCode());
            log.info("Supabase Signup Body: {}", response.getBody());

            return response.getBody();

        } catch (Exception e) {
            log.error("Fehler bei Supabase Signup", e);
            return null;
        }
    }

    // --------------------------------------------------------------
    // LOGIN (Email + Passwort)
    // --------------------------------------------------------------
    public Map<String, Object> login(String email, String password) {
        try {
            String url = supabaseUrl + "/auth/v1/token?grant_type=password";

            Map<String, Object> body = Map.of(
                    "email", email,
                    "password", password
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", anonKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            log.info("Supabase Login Status: {}", response.getStatusCode());
            log.info("Supabase Login Body: {}", response.getBody());

            return response.getBody();

        } catch (Exception e) {
            log.error("Technischer Fehler bei Supabase Login", e);
            return null;
        }
    }

    // --------------------------------------------------------------
    // PASSWORT-UPDATE (Admin-Endpoint)
    // --------------------------------------------------------------
    public boolean updatePasswordAdmin(String authUserId, String newPassword) {
        try {
            String url = supabaseUrl + "/auth/v1/admin/users/" + authUserId;

            Map<String, Object> body = Map.of(
                    "password", newPassword
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", serviceRoleKey);
            headers.set("Authorization", "Bearer " + serviceRoleKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.PUT,
                    request,
                    Map.class
            );

            log.info("Supabase Admin Update Password Status: {}", response.getStatusCode());
            return response.getStatusCode().is2xxSuccessful();

        } catch (Exception e) {
            log.error("Fehler bei Supabase Admin Passwort-Update", e);
            return false;
        }
    }
}
