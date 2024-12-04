package org.justmevp.InstaClone.payload.auth.post;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class PhotoProfileDTO {

    private long id;

    private String name;

    private String description;

    private String fileName;

    private String profileImage;

}
