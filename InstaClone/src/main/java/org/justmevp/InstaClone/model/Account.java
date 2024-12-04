package org.justmevp.InstaClone.model;

import java.time.LocalDateTime;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Setter
@Getter
@ToString
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private long id;

    @Column(unique = true)
    private String email;

    private String password;    

    private String authorities;

    @Column(name = "token")
    private String passwordResetToken;
    private LocalDateTime password_reset_token_expiry;


    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL)
    private Users user;

}
