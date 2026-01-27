// backend/src/main/java/com/uniagent/backend/service/SupabaseDatabaseClient.java
package com.uniagent.backend.service;

import com.uniagent.backend.dto.ChatMessageDto;
import com.uniagent.backend.dto.ChatSummaryDto;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

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
     * Aktualisiert Vorname/Nachname für den User in deiner users-Tabelle.
     */
    public void updateUserNames(String authUserId, String firstName, String lastName) {
        String sql = """
            UPDATE users
            SET first_name = ?, last_name = ?
            WHERE auth_user_id = ?::uuid
        """;
        jdbcTemplate.update(sql, firstName, lastName, authUserId);
    }

    // =========================================================
    // Chats + Messages (Persistenz für Sidebar + Suche + Löschen)
    // Voraussetzung: Tabellen public.chats & public.chat_messages
    // =========================================================

    public UUID createChat(UUID authUserId, String title) {
        UUID id = UUID.randomUUID();
        String safeTitle = (title == null || title.trim().isBlank()) ? "Neuer Chat" : title.trim();

        String sql = """
            INSERT INTO public.chats (id, auth_user_id, title, created_at, updated_at)
            VALUES (?::uuid, ?::uuid, ?, now(), now())
        """;

        jdbcTemplate.update(sql, id.toString(), authUserId.toString(), safeTitle);
        return id;
    }

    public List<ChatSummaryDto> listChats(UUID authUserId) {
        String sql = """
            SELECT
              c.id::text AS id,
              c.title AS title,
              COALESCE((
                SELECT m.content
                FROM public.chat_messages m
                WHERE m.chat_id = c.id
                ORDER BY m.created_at DESC
                LIMIT 1
              ), '') AS last_message,
              c.updated_at::text AS updated_at,
              c.created_at::text AS created_at
            FROM public.chats c
            WHERE c.auth_user_id = ?::uuid
            ORDER BY c.updated_at DESC
        """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, authUserId.toString());

        List<ChatSummaryDto> result = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            result.add(new ChatSummaryDto(
                    String.valueOf(r.get("id")),
                    String.valueOf(r.get("title")),
                    String.valueOf(r.get("last_message")),
                    String.valueOf(r.get("updated_at")),
                    String.valueOf(r.get("created_at"))
            ));
        }
        return result;
    }

    public List<ChatMessageDto> getMessages(UUID authUserId, UUID chatId) {
        // Ownership check
        Integer cnt = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM public.chats WHERE id = ?::uuid AND auth_user_id = ?::uuid",
                Integer.class,
                chatId.toString(),
                authUserId.toString()
        );
        if (cnt == null || cnt == 0) return List.of();

        String sql = """
            SELECT id::text AS id, sender, content, created_at::text AS created_at
            FROM public.chat_messages
            WHERE chat_id = ?::uuid
            ORDER BY created_at ASC
        """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, chatId.toString());

        List<ChatMessageDto> result = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            result.add(new ChatMessageDto(
                    String.valueOf(r.get("id")),
                    String.valueOf(r.get("sender")),
                    String.valueOf(r.get("content")),
                    String.valueOf(r.get("created_at"))
            ));
        }
        return result;
    }

    public void addMessage(UUID authUserId, UUID chatId, String sender, String content) {
        // Ownership check
        Integer cnt = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM public.chats WHERE id = ?::uuid AND auth_user_id = ?::uuid",
                Integer.class,
                chatId.toString(),
                authUserId.toString()
        );
        if (cnt == null || cnt == 0) {
            throw new IllegalArgumentException("Chat nicht gefunden oder keine Berechtigung.");
        }

        String safeSender = (sender == null) ? "user" : sender.trim();
        if (!safeSender.equals("user") && !safeSender.equals("bot")) {
            throw new IllegalArgumentException("Ungültiger Sender (nur 'user' oder 'bot').");
        }

        String safeContent = (content == null) ? "" : content.trim();
        if (safeContent.isBlank()) {
            throw new IllegalArgumentException("Nachricht leer.");
        }

        jdbcTemplate.update(
                "INSERT INTO public.chat_messages (chat_id, sender, content, created_at) VALUES (?::uuid, ?, ?, now())",
                chatId.toString(),
                safeSender,
                safeContent
        );

        jdbcTemplate.update(
                "UPDATE public.chats SET updated_at = now() WHERE id = ?::uuid",
                chatId.toString()
        );
    }

    public boolean deleteChat(UUID authUserId, UUID chatId) {
        int affected = jdbcTemplate.update(
                "DELETE FROM public.chats WHERE id = ?::uuid AND auth_user_id = ?::uuid",
                chatId.toString(),
                authUserId.toString()
        );
        // chat_messages werden per ON DELETE CASCADE automatisch gelöscht
        return affected > 0;
    }

    /**
     * Optional: setzt den Titel automatisch anhand der ersten User-Nachricht,
     * aber nur wenn der Titel aktuell noch "Neuer Chat" ist.
     */
    public void maybeAutoTitle(UUID authUserId, UUID chatId, String firstUserMessage) {
        String current;
        try {
            current = jdbcTemplate.queryForObject(
                    "SELECT title FROM public.chats WHERE id = ?::uuid AND auth_user_id = ?::uuid",
                    String.class,
                    chatId.toString(),
                    authUserId.toString()
            );
        } catch (EmptyResultDataAccessException e) {
            return;
        }

        if (current == null) return;
        if (!current.trim().equalsIgnoreCase("Neuer Chat")) return;

        String t = (firstUserMessage == null) ? "" : firstUserMessage.trim();
        if (t.isBlank()) return;
        if (t.length() > 42) t = t.substring(0, 42) + "…";

        jdbcTemplate.update(
                "UPDATE public.chats SET title = ?, updated_at = now() WHERE id = ?::uuid AND auth_user_id = ?::uuid",
                t,
                chatId.toString(),
                authUserId.toString()
        );
    }

    public List<ChatSummaryDto> searchChats(UUID authUserId, String q) {
        String query = (q == null) ? "" : q.trim();
        if (query.isBlank()) return List.of();

        String like = "%" + query + "%";

        String sql = """
            SELECT DISTINCT
              c.id::text AS id,
              c.title AS title,
              COALESCE((
                SELECT m2.content
                FROM public.chat_messages m2
                WHERE m2.chat_id = c.id
                ORDER BY m2.created_at DESC
                LIMIT 1
              ), '') AS last_message,
              c.updated_at::text AS updated_at,
              c.created_at::text AS created_at
            FROM public.chats c
            LEFT JOIN public.chat_messages m ON m.chat_id = c.id
            WHERE c.auth_user_id = ?::uuid
              AND (c.title ILIKE ? OR m.content ILIKE ?)
            ORDER BY c.updated_at DESC
            LIMIT 50
        """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                sql,
                authUserId.toString(),
                like,
                like
        );

        List<ChatSummaryDto> result = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            result.add(new ChatSummaryDto(
                    String.valueOf(r.get("id")),
                    String.valueOf(r.get("title")),
                    String.valueOf(r.get("last_message")),
                    String.valueOf(r.get("updated_at")),
                    String.valueOf(r.get("created_at"))
            ));
        }
        return result;
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