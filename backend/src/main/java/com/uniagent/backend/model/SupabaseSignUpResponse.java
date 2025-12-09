// backend/src/main/java/com/uniagent/backend/model/SupabaseSignUpResponse.java
package com.uniagent.backend.model;

import java.util.Map;

public class SupabaseSignUpResponse {

    private String id;
    private String email;
    private Map<String, Object> rawBody;

    public SupabaseSignUpResponse() {
    }

    public SupabaseSignUpResponse(String id, String email, Map<String, Object> rawBody) {
        this.id = id;
        this.email = email;
        this.rawBody = rawBody;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Map<String, Object> getRawBody() {
        return rawBody;
    }

    public void setRawBody(Map<String, Object> rawBody) {
        this.rawBody = rawBody;
    }
}
