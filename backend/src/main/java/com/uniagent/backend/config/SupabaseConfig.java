package com.uniagent.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;

@Configuration
@Getter
public class SupabaseConfig {

    @Value("${supabase.url}")
    private String projectUrl;

    @Value("${supabase.anon-key}")
    private String anonKey;

    @Value("${supabase.service-role-key}")
    private String serviceRoleKey;

    @Value("${supabase.users-table}")
    private String usersTable;
}