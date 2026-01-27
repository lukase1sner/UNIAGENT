package com.uniagent.backend.controller;

import com.uniagent.backend.dto.*;
import com.uniagent.backend.service.ChatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    private String extractBearer(String authHeader) {
        if (authHeader == null) return null;
        if (!authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        return token.isBlank() ? null : token;
    }

    @PostMapping
    public ResponseEntity<CreateChatResponse> createChat(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) CreateChatRequest request
    ) {
        String token = extractBearer(authHeader);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new CreateChatResponse(false, "Token fehlt.", null, null));
        }

        try {
            return ResponseEntity.ok(chatService.createChat(token, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new CreateChatResponse(false, e.getMessage(), null, null));
        }
    }

    @GetMapping
    public ResponseEntity<List<ChatSummaryDto>> listChats(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String token = extractBearer(authHeader);
        if (token == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(List.of());

        try {
            return ResponseEntity.ok(chatService.listChats(token));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(List.of());
        }
    }

    @GetMapping("/{chatId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getMessages(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String chatId
    ) {
        String token = extractBearer(authHeader);
        if (token == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(List.of());

        try {
            return ResponseEntity.ok(chatService.getMessages(token, chatId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(List.of());
        }
    }

    @PostMapping("/{chatId}/messages")
    public ResponseEntity<AddMessageResponse> addMessage(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String chatId,
            @RequestBody AddMessageRequest request
    ) {
        String token = extractBearer(authHeader);
        if (token == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AddMessageResponse(false, "Token fehlt."));

        try {
            AddMessageResponse resp = chatService.addMessage(token, chatId, request);
            return resp.isSuccess()
                    ? ResponseEntity.ok(resp)
                    : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AddMessageResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{chatId}")
    public ResponseEntity<DeleteChatResponse> deleteChat(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String chatId
    ) {
        String token = extractBearer(authHeader);
        if (token == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new DeleteChatResponse(false, "Token fehlt."));

        try {
            DeleteChatResponse resp = chatService.deleteChat(token, chatId);
            return resp.isSuccess()
                    ? ResponseEntity.ok(resp)
                    : ResponseEntity.status(HttpStatus.NOT_FOUND).body(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new DeleteChatResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<ChatSummaryDto>> search(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(name = "q", required = false) String q
    ) {
        String token = extractBearer(authHeader);
        if (token == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(List.of());

        try {
            return ResponseEntity.ok(chatService.searchChats(token, q));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(List.of());
        }
    }
}