package com.uniagent.backend.service;

import com.uniagent.backend.dto.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ChatService {

    private final SupabaseAuthClient supabaseAuthClient;
    private final SupabaseDatabaseClient supabaseDatabaseClient;

    public ChatService(SupabaseAuthClient supabaseAuthClient, SupabaseDatabaseClient supabaseDatabaseClient) {
        this.supabaseAuthClient = supabaseAuthClient;
        this.supabaseDatabaseClient = supabaseDatabaseClient;
    }

    private UUID requireAuthUserId(String token) {
        var user = supabaseAuthClient.getUserFromAccessToken(token);

        // ✅ record accessors: user.id() statt user.getId()
        String id = (user == null) ? null : user.id();

        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Ungültiger Token.");
        }

        return UUID.fromString(id);
    }

    public CreateChatResponse createChat(String token, CreateChatRequest request) {
        UUID authUserId = requireAuthUserId(token);

        String title = (request != null && request.getTitle() != null && !request.getTitle().trim().isBlank())
                ? request.getTitle().trim()
                : "Neuer Chat";

        UUID chatId = supabaseDatabaseClient.createChat(authUserId, title);
        return new CreateChatResponse(true, "Chat erstellt.", chatId.toString(), title);
    }

    public List<ChatSummaryDto> listChats(String token) {
        UUID authUserId = requireAuthUserId(token);
        return supabaseDatabaseClient.listChats(authUserId);
    }

    public List<ChatMessageDto> getMessages(String token, String chatId) {
        UUID authUserId = requireAuthUserId(token);
        UUID cid = UUID.fromString(chatId);
        return supabaseDatabaseClient.getMessages(authUserId, cid);
    }

    public AddMessageResponse addMessage(String token, String chatId, AddMessageRequest request) {
        UUID authUserId = requireAuthUserId(token);
        UUID cid = UUID.fromString(chatId);

        if (request == null || request.getContent() == null || request.getContent().trim().isBlank()) {
            return new AddMessageResponse(false, "Nachricht fehlt.");
        }

        String sender = (request.getSender() == null) ? "user" : request.getSender().trim();
        if (!sender.equals("user") && !sender.equals("bot")) {
            return new AddMessageResponse(false, "Ungültiger Sender (nur 'user' oder 'bot').");
        }

        supabaseDatabaseClient.addMessage(authUserId, cid, sender, request.getContent().trim());

        // Optional: Titel beim ersten User-Text automatisch setzen (wenn noch "Neuer Chat")
        if (sender.equals("user")) {
            supabaseDatabaseClient.maybeAutoTitle(authUserId, cid, request.getContent().trim());
        }

        return new AddMessageResponse(true, "Nachricht gespeichert.");
    }

    public DeleteChatResponse deleteChat(String token, String chatId) {
        UUID authUserId = requireAuthUserId(token);
        UUID cid = UUID.fromString(chatId);

        boolean ok = supabaseDatabaseClient.deleteChat(authUserId, cid);
        if (ok) return new DeleteChatResponse(true, "Chat gelöscht.");
        return new DeleteChatResponse(false, "Chat nicht gefunden oder keine Berechtigung.");
    }

    public List<ChatSummaryDto> searchChats(String token, String q) {
        UUID authUserId = requireAuthUserId(token);
        String query = (q == null) ? "" : q.trim();
        if (query.isBlank()) return List.of();
        return supabaseDatabaseClient.searchChats(authUserId, query);
    }
}