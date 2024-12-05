package org.justmevp.InstaClone.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.justmevp.InstaClone.model.Account;
import org.justmevp.InstaClone.model.Photo;
import org.justmevp.InstaClone.model.Users;
import org.justmevp.InstaClone.payload.auth.SearchUserDTO;
import org.justmevp.InstaClone.payload.auth.post.PhotoProfileDTO;
import org.justmevp.InstaClone.service.AccountService;
import org.justmevp.InstaClone.service.PhotoService;
import org.justmevp.InstaClone.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin
public class UsersController {
    @Autowired
    private UsersService usersService;

    @Autowired
    private PhotoService photoService;

    @Autowired
    private AccountService accountService;

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(
            @RequestParam String query,
            @RequestParam(required = false) Boolean followedOnly,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Optional<Account> optionalAccount = accountService.findByEmail(email);
            if (optionalAccount.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found or unauthorized");
            }
            Users authUser = optionalAccount.get().getUser();
            
            List<Users> users;
            if (Boolean.TRUE.equals(followedOnly)) {
                users = usersService.searchFollowedUsers(authUser.getId(), query);
            } else {
                users = usersService.searchUsers(query);
            }

            // Convert Users sang SearchUserDTO với ảnh đại diện
            List<SearchUserDTO> response = users.stream()
                    .<SearchUserDTO>map(user -> {
                        // Lấy ảnh đại diện của user
                        Optional<Photo> optionalPhoto = photoService.findByUserId(user.getId());
                        PhotoProfileDTO photoProfileDTO = null;
                        
                        if (optionalPhoto.isPresent()) {
                            Photo photo = optionalPhoto.get();
                            String profileImageUrl = "/auth/users/" + user.getId() + "/profiles/download-photo";
                            photoProfileDTO = new PhotoProfileDTO(photo.getId(), photo.getName(),
                                    photo.getDescription(), photo.getFileName(), profileImageUrl);
                        }

                        return SearchUserDTO.builder()
                                .id(user.getId())
                                .userName(user.getUserName())
                                .name(user.getName())
                                .photoProfileDTO(photoProfileDTO)
                                .bio(user.getBio())
                                .build();
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Lỗi khi tìm kiếm người dùng: " + e.getMessage());
        }
    }
}