package com.uniagent.backend.controller;

import com.uniagent.backend.dto.LoginRequest;
import com.uniagent.backend.dto.LoginResponse;
import com.uniagent.backend.dto.RegisterRequest;
import com.uniagent.backend.dto.RegisterResponse;
import com.uniagent.backend.dto.ChangePasswordRequest;
import com.uniagent.backend.dto.ChangePasswordResponse;
import com.uniagent.backend.dto.UpdateProfileRequest;
import com.uniagent.backend.dto.UpdateProfileResponse;
import com.uniagent.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<ChangePasswordResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        ChangePasswordResponse response = authService.changePassword(request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            if ("Aktuelles Passwort ist falsch.".equals(response.getMessage())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<UpdateProfileResponse> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if (token == null || token.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new UpdateProfileResponse(false, "Token fehlt."));
        }

        UpdateProfileResponse response = authService.updateProfile(token, request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            if ("Ungültiger Token.".equals(response.getMessage())
                    || "Token fehlt.".equals(response.getMessage())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}