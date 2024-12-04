package org.justmevp.InstaClone.payload.auth.post;


import java.sql.Timestamp;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PostByUserDTO {

    
    
    private long id;

    private String profileImage;

    private String caption;
    
    private String userName;

    private Timestamp dateTime;

    private List<PhotoDTO> photos;
}
