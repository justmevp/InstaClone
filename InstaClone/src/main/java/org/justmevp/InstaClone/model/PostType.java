package org.justmevp.InstaClone.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@ToString
public class PostType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String postTypeName;
    public void setPostTypeName(String postTypeName) {
        if (postTypeName.equals("normal") || postTypeName.equals("story") || postTypeName.equals("reels")) {
            this.postTypeName = postTypeName;
        } else {
            throw new IllegalArgumentException("Invalid post type. Allowed values are: normal, story, reels.");
        }
    }

}
