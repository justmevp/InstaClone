package org.justmevp.InstaClone.controller;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

import org.justmevp.InstaClone.model.Account;
import org.justmevp.InstaClone.model.Follower;
import org.justmevp.InstaClone.model.Photo;
import org.justmevp.InstaClone.model.Users;
import org.justmevp.InstaClone.payload.auth.UsersViewProfileDTO;
import org.justmevp.InstaClone.payload.auth.post.PhotoProfileDTO;
import org.justmevp.InstaClone.payload.follower.FollowerViewDTO;
import org.justmevp.InstaClone.service.AccountService;
import org.justmevp.InstaClone.service.FollowerService;
import org.justmevp.InstaClone.service.PhotoService;
import org.justmevp.InstaClone.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
@Tag(name = "Follower Controller", description = "Controller for Follower management")
@Slf4j
public class FollowerController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private UsersService usersService;

    @Autowired
    private FollowerService followerService;

    @Autowired
    private PhotoService photoService;

    @PostMapping(value = "/users/{user_id}/followers/add", produces = "application/json")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiResponse(responseCode = "400", description = "Please check the payload or token")
    @ApiResponse(responseCode = "200", description = "Follower added")
    @Operation(summary = "Add a new Follower")
    @SecurityRequirement(name = "studyeasy-demo-api")
    public ResponseEntity<FollowerViewDTO> addFollower(@PathVariable long user_id, Authentication authentication) {
        String email = authentication.getName();
        Optional<Account> optionalAccount = accountService.findByEmail(email);
        if (optionalAccount.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        Users follower = optionalAccount.get().getUser();
        Optional<Users> optionalUsers = usersService.findById(user_id);
        if (optionalUsers.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        Users user = optionalUsers.get();
        Follower follow = new Follower();
        if (user.getId() != follower.getId()) {
            follow.setFollower(follower);
            follow.setUser(user);
            followerService.save(follow);
            FollowerViewDTO followerViewDTO = new FollowerViewDTO(follow.getId(), user_id,
                    follow.getFollower().getId());
            return ResponseEntity.ok(followerViewDTO);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
    }

    @GetMapping(value = "/users/{user_id}/followers", produces = "application/json")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "200", description = "List of followers")
    @ApiResponse(responseCode = "401", description = "Token missing")
    @ApiResponse(responseCode = "400", description = "Invalid User Id")
    @ApiResponse(responseCode = "403", description = "Token Error")
    @Operation(summary = "Get list of followers")
    @SecurityRequirement(name = "studyeasy-demo-api")
    public ResponseEntity<List<FollowerViewDTO>> followers(@PathVariable long user_id,
            Authentication authentication) {
        String email = authentication.getName();
        Optional<Account> optionalAccount = accountService.findByEmail(email);
        if (optionalAccount.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        List<FollowerViewDTO> followers = new ArrayList<>();
        for (Follower follow : followerService.findByUserId(user_id)) {
            followers.add(
                    new FollowerViewDTO(follow.getId(), user_id,
                            follow.getFollower().getId()));
        }
        return ResponseEntity.ok(followers);

    }

    @GetMapping(value = "/users/mutual-friends", produces = "application/json")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "200", description = "List of mutual friends")
    @ApiResponse(responseCode = "401", description = "Token missing")
    @ApiResponse(responseCode = "400", description = "Invalid User Id")
    @Operation(summary = "Get list of mutual friends")
    @SecurityRequirement(name = "studyeasy-demo-api")
    public ResponseEntity<List<UsersViewProfileDTO>> getMutualFriends(Authentication authentication) {
        String email = authentication.getName();
        Optional<Account> optionalAccount = accountService.findByEmail(email);

        if (optionalAccount.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        long user_id = optionalAccount.get().getUser().getId();
        Optional<Users> optionalUser = usersService.findById(user_id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        List<Follower> followersOfUser = followerService.findByUserId(user_id);
        List<UsersViewProfileDTO> mutualFriends = new ArrayList<>();

        for (Follower follower : followersOfUser) {
            long followerId = follower.getFollower().getId();
            Optional<Follower> reverseFollow = followerService.findByUserIdAndFollowerId(followerId, user_id);

            if (reverseFollow.isPresent()) {
                Users mutualFriend = follower.getFollower();
                Optional<Photo> optionalPhoto = photoService.findByUserId(followerId);
                if (optionalPhoto.isPresent()) {
                    Photo photo = optionalPhoto.get();
                    String link2 = "/auth/users/" + followerId + "/profiles" +
                            "/download-photo";
                    PhotoProfileDTO photoProfileDTO = new PhotoProfileDTO(photo.getId(), photo.getName(),
                            photo.getDescription(), photo.getFileName(), link2);
                    UsersViewProfileDTO userProfileDTO = new UsersViewProfileDTO(mutualFriend.getId(),mutualFriend.getUserName(),
                            mutualFriend.getName(), photoProfileDTO);
                    mutualFriends.add(userProfileDTO);
                }
            }
        }
        return ResponseEntity.ok(mutualFriends);

    }

    @GetMapping("/users/{user_id}/follow-status")
    @Operation(summary = "Get list of mutual friends")
    @ResponseStatus(HttpStatus.OK)
    @SecurityRequirement(name = "studyeasy-demo-api")
    public ResponseEntity<String> checkFollowStatus(@PathVariable long user_id, Authentication authentication) {
        String email = authentication.getName();
        Optional<Account> optionalAccount = accountService.findByEmail(email);
        Users follower = optionalAccount.get().getUser();
        boolean isFollowing = followerService.isFollowing(follower.getId(), user_id);
        return ResponseEntity.ok(isFollowing ? "F" : null);
    }

    @DeleteMapping(value = "/users/{user_id}/followers/{follower_id}/delete", produces = "application/json")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "200", description = "Follower deleted")
    @ApiResponse(responseCode = "401", description = "Token missing or invalid")
    @ApiResponse(responseCode = "400", description = "Invalid User Id or Follower Id")
    @ApiResponse(responseCode = "403", description = "Permission Denied")
    @Operation(summary = "Delete a follower")
    @SecurityRequirement(name = "studyeasy-demo-api")
    public ResponseEntity<String> deleteFollower(
            @PathVariable long user_id,
            @PathVariable long follower_id,
            Authentication authentication) {

        String email = authentication.getName();
        Optional<Account> optionalAccount = accountService.findByEmail(email);
        if (optionalAccount.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access: Invalid token");
        }
        Users user = optionalAccount.get().getUser();
        Optional<Follower> optionalFollower = followerService.findByUserIdAndFollowerId(user_id, follower_id);
        if (optionalFollower.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Follower not found with the given IDs");
        }
        Follower follower = optionalFollower.get();
        if (user.getId() != follower.getUser().getId() && user.getId() != follower.getFollower().getId()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to delete this follower");
        }
        followerService.delete(follower);
        return ResponseEntity.ok("Follower deleted successfully");
    }

}
