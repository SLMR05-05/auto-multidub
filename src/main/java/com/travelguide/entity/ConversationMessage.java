package com.travelguide.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_messages", indexes = {
        @Index(name = "idx_msg_session", columnList = "session_id")
})
public class ConversationMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ConversationSession session;

    @Column(nullable = false, length = 20)
    private String senderType; // USER or ASSISTANT

    @Column(nullable = false, length = 20)
    private String inputType; // VOICE or TEXT

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 500)
    private String audioUrl;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public ConversationSession getSession() { return session; }
    public void setSession(ConversationSession session) { this.session = session; }
    public String getSenderType() { return senderType; }
    public void setSenderType(String senderType) { this.senderType = senderType; }
    public String getInputType() { return inputType; }
    public void setInputType(String inputType) { this.inputType = inputType; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
