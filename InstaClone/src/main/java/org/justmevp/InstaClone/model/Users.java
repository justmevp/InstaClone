package org.justmevp.InstaClone.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Setter
@Getter
@ToString
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private long id;
	private String userName;
	private String name;
	private String profileImage;
    private String coverImage;
    private LocalDateTime signUpDate;
    private String bio;
    private String phoneNumber;
    private String address;
    private String dateOfBirth;

    @OneToOne
    @JoinColumn(name = "account_id", referencedColumnName = "id")
    private Account account;

      // Phương thức để thiết lập signUpDate trước khi lưu vào cơ sở dữ liệu
    @PrePersist
    protected void onCreate() {
        this.signUpDate = LocalDateTime.now();
    }
    
}
