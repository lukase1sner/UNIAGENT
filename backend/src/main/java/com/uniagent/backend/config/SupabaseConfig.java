// backend/src/main/java/com/uniagent/backend/config/SupabaseConfig.java
package com.uniagent.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;

@Configuration
@Getter
public class SupabaseConfig {

    // URL deines Supabase-Projekts
    @Value("${supabase.url}")
    private String projectUrl;

    // Anon-Key (public)
    @Value("${supabase.anon-key}")
    private String anonKey;

    // Service-Role-Key (geheime Server-Variante)
    @Value("${supabase.service-role-key}")
    private String serviceRoleKey;

    // Tabellenname für deine User-Tabelle
    @Value("${supabase.users-table}")
    private String usersTable;
}