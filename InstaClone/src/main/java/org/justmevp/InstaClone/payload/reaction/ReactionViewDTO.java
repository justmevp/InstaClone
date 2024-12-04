package org.justmevp.InstaClone.payload.reaction;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReactionViewDTO {
    private long id;
    private Boolean isLike;
    private long userId;
    private long postId;
    
}
