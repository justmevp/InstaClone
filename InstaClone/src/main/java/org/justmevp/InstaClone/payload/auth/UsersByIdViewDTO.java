package org.justmevp.InstaClone.payload.auth;

import org.justmevp.InstaClone.payload.auth.post.PhotoCoverDTO;
import org.justmevp.InstaClone.payload.auth.post.PhotoProfileDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UsersByIdViewDTO {
    private long id;
    private String userName;
    private String name;
    private String bio;
    private String phoneNumber;
    private String address;
    private PhotoProfileDTO photoProfile;
    private PhotoCoverDTO coverPhoto;
}
