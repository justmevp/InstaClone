package org.justmevp.InstaClone.payload.comment;

import java.time.LocalDateTime;

import org.justmevp.InstaClone.payload.auth.post.PhotoProfileDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CommentViewDTO {
    private Long id;
    private String username;
    private PhotoProfileDTO profilePhoto;
    private String comment;
    private Long commentRepliedToId;
    private LocalDateTime dateTime;
}
