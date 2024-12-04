package org.justmevp.InstaClone.payload.auth.post;


import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PostViewDTO {

    
    
    private long id;

    private String profileImage;

    private String caption;
    
    private String userName;

    private List<PhotoDTO> photos;
}
