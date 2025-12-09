// backend/src/main/java/com/uniagent/backend/service/SupabaseDatabaseClient.java
package com.uniagent.backend.service;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SupabaseDatabaseClient {

    private final JdbcTemplate jdbcTemplate;

    public SupabaseDatabaseClient(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Legt einen neuen Benutzer in deiner eigenen Postgres-Tabelle an.
     *
     * Erwartet eine Tabelle z.B. "users" mit Spalten:
     *   id           uuid (mit Default gen_random_uuid() oder ähnlichem)
     *   auth_user_id uuid
     *   first_name   text
     *   last_name    text
     *   role         text
     */
    public void insertUser(String authUserId, String firstName, String lastName, String role) {
        String sql = """
            INSERT INTO users (auth_user_id, first_name, last_name, role)
            VALUES (?::uuid, ?, ?, ?)
        """;

        jdbcTemplate.update(sql, authUserId, firstName, lastName, role);
    }

    /**
     * Liest einen Benutzer anhand der Supabase auth_user_id.
     */
    public Optional<UserRecord> findByAuthUserId(String authUserId) {
        String sql = """
            SELECT id, auth_user_id, first_name, last_name, role
            FROM users
            WHERE auth_user_id = ?::uuid
        """;

        try {
            List<UserRecord> result = jdbcTemplate.query(
                    sql,
                    ps -> ps.setString(1, authUserId),
                    (rs, rowNum) -> new UserRecord(
                            rs.getString("id"),           // id ist UUID -> String
                            rs.getString("auth_user_id"), // ebenfalls UUID
                            rs.getString("first_name"),
                            rs.getString("last_name"),
                            rs.getString("role")
                    )
            );

            return result.stream().findFirst();

        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    /**
     * Kleiner DTO-Record für den Benutzer aus deiner eigenen Tabelle.
     */
    public record UserRecord(
            String id,
            String authUserId,
            String firstName,
            String lastName,
            String role
    ) {}
}
