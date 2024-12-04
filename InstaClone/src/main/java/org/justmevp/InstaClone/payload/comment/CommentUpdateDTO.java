package org.justmevp.InstaClone.payload.comment;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class CommentUpdateDTO {
     @Schema(description = "comment", example = "messi is the goat", required = true)
    private String comment;
}
