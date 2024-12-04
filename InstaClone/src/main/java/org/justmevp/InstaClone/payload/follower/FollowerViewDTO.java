package org.justmevp.InstaClone.payload.follower;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FollowerViewDTO {
     private Long id;
     private Long UserId;
     private Long followerId;
}
