package org.justmevp.InstaClone.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.sql.Timestamp;


@Entity
@Getter
@Setter
@ToString
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private long postId;

    private String userName;
    private String caption;
    private String postImgURL;
    private int likes;
    private Timestamp dateTime;

    // Mối quan hệ ManyToOne với User
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private Users user;

    @ManyToOne
    @JoinColumn(name = "post_type_id" , referencedColumnName = "id")
    private PostType postType;

    @PrePersist
    protected void onCreate() {
        this.dateTime = new Timestamp(System.currentTimeMillis());
    }
    
}
