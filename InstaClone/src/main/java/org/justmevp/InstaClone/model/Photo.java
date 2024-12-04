package org.justmevp.InstaClone.model;


import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Photo {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private long id;

    private String name;

    private String description;

    private String originalFileName;

    private String fileName;

    @ManyToOne
    @JoinColumn(name = "post_id", referencedColumnName = "postId", nullable = true)
    private Post post;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private Users user;

    
    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "usercover_id", referencedColumnName = "id")
    private Users usercover;
}
