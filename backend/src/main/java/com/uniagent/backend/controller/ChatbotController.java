package com.uniagent.backend.controller;

import com.uniagent.backend.dto.ChatRequest;
import com.uniagent.backend.dto.ChatResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "http://localhost:5173") // wie im Frontend
public class ChatbotController {

    @Value("${n8n.webhook.url}")
    private String n8nWebhookUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<ChatRequest> entity = new HttpEntity<>(request, headers);

            // Antwort von n8n zunächst als String holen
            ResponseEntity<String> response = restTemplate.postForEntity(
                    n8nWebhookUrl,
                    entity,
                    String.class
            );

            String body = response.getBody();
            String replyText;

            if (response.getStatusCode().is2xxSuccessful()
                    && body != null
                    && !body.isBlank()) {

                // aktuell: n8n darf einfach Text zurückgeben
                replyText = body;
            } else {
                replyText =
                        "Sorry, ich konnte keine Antwort vom Chatbot-Service erhalten.";
            }

            ChatResponse chatResponse = new ChatResponse(replyText);
            return ResponseEntity.ok(chatResponse);

        } catch (RestClientException ex) {
            ex.printStackTrace(); // fürs Debugging in der Konsole
            ChatResponse error =
                    new ChatResponse("Error while contacting chatbot service.");
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error);
        }
    }
}
