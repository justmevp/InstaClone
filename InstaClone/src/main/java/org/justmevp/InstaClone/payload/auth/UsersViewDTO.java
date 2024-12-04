package org.justmevp.InstaClone.payload.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UsersViewDTO {

    private String userName;
	private String name;
    private String bio;
    private String phoneNumber;
    private String address;
    private String profileImage;
    private String coverImage;
}
