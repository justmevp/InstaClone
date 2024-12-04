package org.justmevp.InstaClone.controller;

import java.util.List;
import java.util.Optional;

import org.justmevp.InstaClone.model.Account;
import org.justmevp.InstaClone.model.Post;
import org.justmevp.InstaClone.model.Reaction;
import org.justmevp.InstaClone.model.Users;
import org.justmevp.InstaClone.payload.reaction.ReactionViewDTO;
import org.justmevp.InstaClone.service.AccountService;
import org.justmevp.InstaClone.service.PostService;
import org.justmevp.InstaClone.service.ReactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
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

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
@Tag(name = "Reaction Controller", description = "Controller for Reaction management")
@Slf4j
public class ReactionController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private ReactionService reactionService;

    @Autowired
    private PostService postService;

    @GetMapping(value = "/posts/{post_id}/reactions")
    @ApiResponse(responseCode = "200", description = "List of reactions")
    @ApiResponse(responseCode = "400", description = "Post not found")
    @Operation(summary = "Get reactions for a post")
    @SecurityRequirement(name = "studyeasy-demo-api")
    public ResponseEntity<List<ReactionViewDTO>> getReactions(@PathVariable long post_id) {
        Optional<Post> optionalPost = postService.findById(post_id);
        if (optionalPost.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        List<ReactionViewDTO> reactions = reactionService.findByPostId(post_id)
                .stream()
                .map(reaction -> new ReactionViewDTO(
                        reaction.getId(),
                        reaction.getIsLike(),
                        reaction.getPost().getPostId(),
                        reaction.getUser().getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(reactions);
    }

    @PostMapping(value = "/posts/{post_id}/reactions/add")
    @ApiResponse(responseCode = "500", description = "Please check your token")
    @ApiResponse(responseCode = "400", description = "Post not found")
    @ApiResponse(responseCode = "200", description = "Reaction added")
    @Operation(summary = "Add a new Reaction")
    @SecurityRequirement(name = "studyeasy-demo-api")
    @ResponseStatus(HttpStatus.OK)
    @Transactional
    public ResponseEntity<ReactionViewDTO> addReaction(@PathVariable long post_id, Authentication authentication) {
        String email = authentication.getName();
        Optional<Account> optionalAccount = accountService.findByEmail(email);
        if (optionalAccount.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        Users users = optionalAccount.get().getUser();
        Optional<Post> optionalPost = postService.findById(post_id);
        if (optionalPost.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        Optional<Reaction> optionalReaction = reactionService.findByPostIdAndUserId(post_id, users.getId());
        if (optionalReaction.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }
        Reaction reaction = new Reaction();
        reaction.setIsLike(true);
        reaction.setPost(optionalPost.get());
        reaction.setUser(users);
        reactionService.save(reaction);
        ReactionViewDTO reactionViewDTO = new ReactionViewDTO(reaction.getId(), reaction.getIsLike(),
                reaction.getPost().getPostId(), reaction.getUser().getId());
        return ResponseEntity.ok(reactionViewDTO);
    }

    @GetMapping(value = "/posts/{post_id}/reactions/check")
    @ApiResponse(responseCode = "200", description = "Check if user has liked the post")
    @Operation(summary = "Check if current user has liked the post")
    @SecurityRequirement(name = "studyeasy-demo-api")
    public ResponseEntity<Boolean> checkUserReaction(@PathVariable long post_id, Authentication authentication) {
        String email = authentication.getName();
        Optional<Account> optionalAccount = accountService.findByEmail(email);
        if (optionalAccount.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
        }
        Users users = optionalAccount.get().getUser();
        Optional<Post> optionalPost = postService.findById(post_id);
        if (optionalPost.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
        boolean hasLiked = reactionService.findByPostId(post_id)
                .stream()
                .anyMatch(reaction -> reaction.getUser().getId() == users.getId());
        return ResponseEntity.ok(hasLiked);
    }

    @DeleteMapping(value = "/posts/{post_id}/reactions/delete")
    @ApiResponse(responseCode = "500", description = "Please check your token")
    @ApiResponse(responseCode = "400", description = "Post not found")
    @ApiResponse(responseCode = "200", description = "Reaction deleted")
    @Operation(summary = "Delete a Reaction")
    @SecurityRequirement(name = "studyeasy-demo-api")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> deleteReaction(@PathVariable long post_id, Authentication authentication) {
        String email = authentication.getName();
        Optional<Account> optionalAccount = accountService.findByEmail(email);
        if (optionalAccount.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        Users users = optionalAccount.get().getUser();
        Optional<Post> optionalPost = postService.findById(post_id);
        if (optionalPost.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        Optional<Reaction> optionalReaction = reactionService.findByPostIdAndUserId(post_id, users.getId());
        if (optionalReaction.isPresent()) {
            Reaction reaction = optionalReaction.get();
            reactionService.delete(reaction);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body("Reaction Deleted");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
    }
}
