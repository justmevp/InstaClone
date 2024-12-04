package org.justmevp.InstaClone.payload.auth;

import org.justmevp.InstaClone.payload.auth.post.PhotoProfileDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ProfileDTO {
   
    private long id;
    private long userId;
    private String email;
    private String authorities;
    private String name;
    private String username;
    private PhotoProfileDTO photoProfile;

}
