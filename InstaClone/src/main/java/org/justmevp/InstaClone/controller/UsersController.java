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

    // API endpoint để tìm kiếm người dùng
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(
            // Từ khóa tìm kiếm
            @RequestParam String query,
            // Tùy chọn chỉ tìm trong danh sách người đang follow (không bắt buộc)
            @RequestParam(required = false) Boolean followedOnly,
            // Thông tin xác thực của người dùng hiện tại
            Authentication authentication) {
        try {
            // Lấy email từ thông tin xác thực
            String email = authentication.getName();
            // Tìm tài khoản dựa trên email
            Optional<Account> optionalAccount = accountService.findByEmail(email);
            if (optionalAccount.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found or unauthorized");
            }
            // Lấy thông tin người dùng từ tài khoản
            Users authUser = optionalAccount.get().getUser();

            List<Users> users;
            // Nếu followedOnly = true, chỉ tìm trong danh sách người đang follow
            if (Boolean.TRUE.equals(followedOnly)) {
                users = usersService.searchFollowedUsers(authUser.getId(), query);
            } else {
                // Ngược lại tìm trong tất cả người dùng
                users = usersService.searchUsers(query);
            }

            // Chuyển đổi danh sách Users thành SearchUserDTO, bao gồm cả thông tin ảnh đại diện
            List<SearchUserDTO> response = users.stream()
                    .map(user -> {
                        // Tìm ảnh đại diện của người dùng
                        Optional<Photo> optionalPhoto = photoService.findByUserId(user.getId());
                        PhotoProfileDTO photoProfileDTO = null;

                        // Nếu có ảnh đại diện, tạo URL để tải ảnh
                        if (optionalPhoto.isPresent()) {
                            Photo photo = optionalPhoto.get();
                            String profileImageUrl = "/auth/users/" + user.getId() + "/profiles/download-photo";
                            photoProfileDTO = new PhotoProfileDTO(photo.getId(), photo.getName(),
                                    photo.getDescription(), photo.getFileName(), profileImageUrl);
                        }

                        // Tạo đối tượng DTO chứa thông tin người dùng và ảnh đại diện
                        return SearchUserDTO.builder()
                                .id(user.getId())
                                .userName(user.getUserName())
                                .name(user.getName())
                                .photoProfileDTO(photoProfileDTO)
                                .bio(user.getBio())
                                .build();
                    })
                    .collect(Collectors.toList());

            // Trả về kết quả tìm kiếm thành công
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Xử lý lỗi và trả về thông báo lỗi
            return ResponseEntity.badRequest()
                    .body("Lỗi khi tìm kiếm người dùng: " + e.getMessage());
        }
    }
}