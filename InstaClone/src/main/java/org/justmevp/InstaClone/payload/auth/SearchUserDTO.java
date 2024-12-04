// payload/auth/SearchUserDTO.java
package org.justmevp.InstaClone.payload.auth;

import org.justmevp.InstaClone.payload.auth.post.PhotoProfileDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchUserDTO {
    private long id;
    private String userName;
    private String name;
    private PhotoProfileDTO photoProfileDTO;
    private String bio;
}