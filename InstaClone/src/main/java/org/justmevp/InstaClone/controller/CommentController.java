package org.justmevp.InstaClone.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.justmevp.InstaClone.model.Account;
import org.justmevp.InstaClone.model.Comment;
import org.justmevp.InstaClone.model.Photo;
import org.justmevp.InstaClone.model.Post;
import org.justmevp.InstaClone.model.Users;
import org.justmevp.InstaClone.payload.auth.post.PhotoProfileDTO;
import org.justmevp.InstaClone.payload.comment.CommentDTO;
import org.justmevp.InstaClone.payload.comment.CommentUpdateDTO;
import org.justmevp.InstaClone.payload.comment.CommentViewDTO;
import org.justmevp.InstaClone.service.AccountService;
import org.justmevp.InstaClone.service.CommentService;
import org.justmevp.InstaClone.service.PhotoService;
import org.justmevp.InstaClone.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
@Tag(name = "Comment Controller", description = "Controller for Comment management")
@Slf4j
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private AccountService accountService;

    @Autowired
    private PostService postService;
    @Autowired
    private PhotoService photoService;

    @PostMapping(value = "/posts/{post_id}/comment/add", consumes = "application/json")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiResponse(responseCode = "400", description = "Please check the payload or token")
    @ApiResponse(responseCode = "200", description = "Add comment")
    @Operation(summary = "Add a new Comment")
    @SecurityRequirement(name = "studyeasy-demo-api")
    public ResponseEntity<?> addComment(
            @PathVariable("post_id") Long postId,
            @RequestBody CommentDTO commentDTO,
            Authentication authentication) {

        try {
            // Lấy tài khoản của người dùng
            String email = authentication.getName();
            Optional<Account> optionalAccount = accountService.findByEmail(email);
            if (optionalAccount.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found or unauthorized");
            }
            Users user = optionalAccount.get().getUser();

            // Kiểm tra Post có tồn tại không
            Optional<Post> optionalPost = postService.findById(postId);
            if (optionalPost.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Post not found");
            }
            Post post = optionalPost.get();

            // Tạo đối tượng Comment
            Comment comment = new Comment();
            comment.setComment(commentDTO.getComment());
            comment.setUser(user);
            comment.setPost(post);
            comment.setCommentRepliedToId(commentDTO.getCommentRepliedToId());
            comment.setCreatedDatetime(LocalDateTime.now());
            // Lưu Comment vào database
            comment = commentService.save(comment);
            Optional<Photo> optionalPhoto = photoService.findByUserId(comment.getUser().getId());
            Photo photo = optionalPhoto.get();
            String link2 = "/auth/users/" + comment.getUser().getId() + "/profiles" +
                    "/download-photo";
            PhotoProfileDTO photoProfileDTO = new PhotoProfileDTO(photo.getId(), photo.getName(),
                    photo.getDescription(), photo.getFileName(), link2);
            CommentViewDTO commentViewDTO = new CommentViewDTO(comment.getId(),comment.getUser().getUserName(),
                    photoProfileDTO, comment.getComment(),comment.getCommentRepliedToId(), comment.getCreatedDatetime());
            return ResponseEntity.ok(commentViewDTO);

        } catch (Exception e) {
            log.error("Error adding comment: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while adding comment");
        }
    }

    @GetMapping(value = "/posts/{post_id}/comments", produces = "application/json")
    @ApiResponse(responseCode = "200", description = "List of comments")
    @ApiResponse(responseCode = "401", description = "Token missing")
    @ApiResponse(responseCode = "403", description = "Token error")
    @SecurityRequirement(name = "studyeasy-demo-api")
    @Operation(summary = "List comments for a post")
    public ResponseEntity<?> comments(@PathVariable("post_id") Long postId, Authentication authentication) {
        String email = authentication.getName();
        Optional<Account> optionalAccount = accountService.findByEmail(email);
        if (optionalAccount.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized user");
        }
        // Kiểm tra xem bài post có tồn tại không
        Optional<Post> optionalPost = postService.findById(postId);
        if (optionalPost.isEmpty()) {
            System.out.println(optionalPost);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        // Nếu có post, lấy các comment cho post này
        Post post = optionalPost.get();
        List<CommentViewDTO> comments = new ArrayList<>();
        for (Comment comment : commentService.findByPostId(post.getPostId())) {
            if (comment.getUser() == null) {
                // Skip comments with no associated user
                continue;
            }
            Optional<Photo> optionalPhoto = photoService.findByUserId(comment.getUser().getId());
            if (optionalPhoto.isEmpty()) {
                continue;
            }
            Photo photo = optionalPhoto.get();
            String link2 = "/auth/users/" + comment.getUser().getId() + "/profiles" +
                    "/download-photo";
            PhotoProfileDTO photoProfileDTO = new PhotoProfileDTO(photo.getId(), photo.getName(),
                    photo.getDescription(), photo.getFileName(), link2);
            comments.add(new CommentViewDTO(comment.getId(), comment.getUser().getUserName(),
                    photoProfileDTO, comment.getComment(), comment.getCommentRepliedToId(), comment.getCreatedDatetime()));
        }

        return ResponseEntity.ok(comments);
    }

    @PutMapping(value = "/posts/{post_id}/comments/{comment_id}/update", produces = "application/json", consumes = "application/json")
    @ApiResponse(responseCode = "200", description = "Comment Updated")
    @ApiResponse(responseCode = "500", description = "Token missing")
    @ApiResponse(responseCode = "403", description = "Comment not found")
    @SecurityRequirement(name = "studyeasy-demo-api")
    @Operation(summary = "Update a Comment")
    public ResponseEntity<?> updateComment(@PathVariable("post_id") Long postId,
            @PathVariable("comment_id") Long commentId, @RequestBody CommentUpdateDTO commentUpdateDTO,
            Authentication authentication) {
        // Lấy tài khoản của người dùng từ email
        String email = authentication.getName();
        Optional<Account> optionalAccount = accountService.findByEmail(email);
        Users user = optionalAccount.get().getUser();
        if (optionalAccount.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized user");
        }

        // Kiểm tra xem bài post có tồn tại không
        Optional<Post> optionalPost = postService.findById(postId);
        if (optionalPost.isEmpty()) {
            System.out.println(optionalPost);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        // Kiểm tra xem comment có tồn tại không
        Optional<Comment> optionalComment = commentService.findById(commentId);
        if (optionalComment.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found");
        }

        // Nếu có post, lấy các comment cho post không
        Comment comment = optionalComment.get();
        if (comment.getUser() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found");
        }
        if (comment.getUser().getId() != user.getId()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not allowed to update this comment");
        }
        comment.setComment(commentUpdateDTO.getComment());
        commentService.save(comment);
        Optional<Photo> optionalPhoto = photoService.findByUserId(comment.getUser().getId());
        if (optionalPhoto.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Photo not found");
        }
        Photo photo = optionalPhoto.get();
        String link2 = "/auth/users/" + comment.getUser().getId() + "/profiles" +
                "/download-photo";
        PhotoProfileDTO photoProfileDTO = new PhotoProfileDTO(photo.getId(), photo.getName(),
                photo.getDescription(), photo.getFileName(), link2);
        CommentViewDTO commentViewDTO =  new CommentViewDTO(comment.getId(),comment.getUser().getUserName(),
        photoProfileDTO, comment.getComment(),comment.getCommentRepliedToId(), comment.getCreatedDatetime());
        return ResponseEntity.ok(commentViewDTO);
    }

    @DeleteMapping(value = "/posts/{post_id}/comments/{comment_id}/delete")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "200", description = "Comment Deleted")
    @ApiResponse(responseCode = "404", description = "Comment not found")
    @ApiResponse(responseCode = "401", description = "Unauthorized access")
    @SecurityRequirement(name = "studyeasy-demo-api")
    @Operation(summary = "Delete a Comment")
    public ResponseEntity<?> deleteComment(@PathVariable("post_id") Long postId,
            @PathVariable("comment_id") Long commentId, Authentication authentication) {
        String email = authentication.getName();
        Optional<Account> optionalAccount = accountService.findByEmail(email);
        if (optionalAccount.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized user");
        }
        Users user = optionalAccount.get().getUser();

        Optional<Post> optionalPost = postService.findById(postId);
        if (optionalPost.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        Optional<Comment> optionalComment = commentService.findById(commentId);
        if (optionalComment.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found");
        }

        Comment comment = optionalComment.get();
        if (comment.getUser() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found");
        }
        if (comment.getUser().getId() != user.getId()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not allowed to delete this comment");
        }

        commentService.delete(comment);
        return ResponseEntity.ok("Comment deleted successfully");
    }

}
