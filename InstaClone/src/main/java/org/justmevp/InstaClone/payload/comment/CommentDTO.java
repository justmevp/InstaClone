package org.justmevp.InstaClone.payload.comment;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CommentDTO {
    private Long id;
    @Schema(description = "comment", example = "messi is the goat", required = true)
    private String comment;
    private Long userId; 
    private Long postId;
    private LocalDateTime createdDatetime;
    private Long commentRepliedToId;
    
}
