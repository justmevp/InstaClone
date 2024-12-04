package org.justmevp.InstaClone.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.apache.commons.lang3.RandomStringUtils;
import org.justmevp.InstaClone.model.Account;
import org.justmevp.InstaClone.model.Photo;
import org.justmevp.InstaClone.model.Users;
import org.justmevp.InstaClone.payload.auth.AccountViewDTO;
import org.justmevp.InstaClone.payload.auth.AuthoritiesDTO;
import org.justmevp.InstaClone.payload.auth.PasswordDTO;
import org.justmevp.InstaClone.payload.auth.ProfileDTO;
import org.justmevp.InstaClone.payload.auth.TokenDTO;
import org.justmevp.InstaClone.payload.auth.UserAccountDTO;
import org.justmevp.InstaClone.payload.auth.UserLoginDTO;
import org.justmevp.InstaClone.payload.auth.UsersByIdViewDTO;
import org.justmevp.InstaClone.payload.auth.UsersDTO;
import org.justmevp.InstaClone.payload.auth.UsersViewDTO;
import org.justmevp.InstaClone.payload.auth.UsersViewProfileDTO;
import org.justmevp.InstaClone.payload.auth.post.PhotoCoverDTO;
import org.justmevp.InstaClone.payload.auth.post.PhotoProfileDTO;

import org.justmevp.InstaClone.service.EmailService;
import org.justmevp.InstaClone.service.PhotoService;
import org.justmevp.InstaClone.service.AccountService;
import org.justmevp.InstaClone.service.TokenService;
import org.justmevp.InstaClone.service.UsersService;
import org.justmevp.InstaClone.util.AppUtils.AppUtil;
import org.justmevp.InstaClone.util.constants.AccountError;
import org.justmevp.InstaClone.util.constants.AccountSuccess;
import org.justmevp.InstaClone.util.emails.EmailDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600, allowedHeaders = "*")
@Tag(name = "Auth Controller", description = "Controller for Account management")
@Slf4j
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    static final String PROFILES_FOL_STRING = "profiles";
    static final String COVER_FOL_STRING = "cover";

    @Autowired
    private EmailService emailService;
    @Value("${password.token.reset.timeout.minutes}")
    private int password_token_timeout;
    @Value("${site.domain}")
    private String site_domain;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private TokenService tokenService;
    @Autowired
    private AccountService accountService;
    @Autowired
    private UsersService usersService;

    @Autowired
    private PhotoService photoService;

    @PostMapping("/token")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<TokenDTO> token(@Valid @RequestBody UserLoginDTO userLogin) throws AuthenticationException {
        try {
            // Thực hiện xác thực người dùng dựa trên email và password
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userLogin.getEmail(), userLogin.getPassword()));

            // Nếu xác thực thành công, tạo JWT và trả về trong ResponseEntity
            return ResponseEntity.ok(new TokenDTO(tokenService.generateToken(authentication)));
        } catch (Exception e) {
            // Nếu xác thực thất bại, ghi log và trả về mã lỗi 400 (Bad Request)
            log.debug(AccountError.TOKEN_GENERATION_ERROR.toString() + ": " + e.getMessage());
            return new ResponseEntity<>(new TokenDTO(null), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping(value = "/users/add", produces = "application/json")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiResponse(responseCode = "400", description = "Please enter a valid email and Password length between 6 to 20 characters")
    @ApiResponse(responseCode = "200", description = "Account added")
    @Operation(summary = "Add a new User")
    public ResponseEntity<String> addUser(@Valid @RequestBody UserAccountDTO useraAccountDTO) {

        try {
            logger.info("Starting to add new user with email: {}", useraAccountDTO.getEmail());
            Account account = new Account();
            account.setEmail(useraAccountDTO.getEmail());
            account.setPassword(useraAccountDTO.getPassword());
            account.setAuthorities("ROLE_USER");
            logger.debug("Account created with email: {}", useraAccountDTO.getEmail());

            Users user = new Users();
            user.setUserName(useraAccountDTO.getUserName());
            user.setName(useraAccountDTO.getName());
            user.setSignUpDate(LocalDateTime.now());
            user.setAccount(account); // Liên kết Account với User
            logger.debug("User created with username: {}", useraAccountDTO.getUserName());

            String defaultProfileImagePath = "InstaClone/src/main/resources/DefaultProfile/defaultprofile.png";
            user.setProfileImage(defaultProfileImagePath);
            File defaultImageFile = new File(defaultProfileImagePath);

            if (defaultImageFile.exists()) {
                logger.info("Default profile image found, processing...");
                String fileName = defaultImageFile.getName();
                String generatedString = RandomStringUtils.random(10, true, true);
                String finalImageName = generatedString + fileName; // Tên file ảnh
                usersService.save(user);
                String absoluteFileLocation = AppUtil.get_profile_photo_upload_path(finalImageName, PROFILES_FOL_STRING,
                        user.getId());

                // Lưu ảnh vào thư mục
                Path path = Paths.get(absoluteFileLocation);
                try {
                    Files.copy(defaultImageFile.toPath(), path, StandardCopyOption.REPLACE_EXISTING);
                    logger.info("Default profile image saved successfully at: {}", absoluteFileLocation);
                } catch (IOException e) {
                    logger.error("Failed to save the default profile image.", e);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Failed to save the default profile image.");
                }

                // Cập nhật đường dẫn ảnh đại diện cho người dùng
                user.setProfileImage(absoluteFileLocation);
                // Lưu User vào cơ sở dữ liệu

                // Tạo và lưu ảnh vào bảng Photo
                Photo photo = new Photo();
                photo.setName("defaultprofile.png");
                photo.setFileName(finalImageName);
                photo.setOriginalFileName("defaultprofile.png");
                photo.setUser(user); // Liên kết với người dùng
                photoService.save(photo);
                logger.info("Default profile image saved to Photo table.");
            } else {
                logger.error("Default profile image not found at path: {}", defaultProfileImagePath);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Default profile image not found.");
            }

            logger.info("User added successfully with email: {}", useraAccountDTO.getEmail());

            return ResponseEntity.ok(AccountSuccess.ACCOUNT_ADDED.toString());
        } catch (Exception e) {
            logger.error("Error occurred while adding user: {}", e.getMessage(), e);
            log.debug(AccountError.ADD_ACCOUNT_ERROR.toString() + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping(value = "/users", produces = "application/json")
    @ApiResponse(responseCode = "200", description = "List of users")
    @ApiResponse(responseCode = "401", description = "Token missing")
    @ApiResponse(responseCode = "403", description = "Token error")
    @SecurityRequirement(name = "studyeasy-demo-api")
    @Operation(summary = "List user api")
    public List<AccountViewDTO> users() {
        List<AccountViewDTO> accounts = new ArrayList<>();
        for (Account account : accountService.findAll()) {
            accounts.add(new AccountViewDTO(account.getId(), account.getEmail(), account.getAuthorities()));

        }
        return accounts;
    }

    @GetMapping(value = "/users/{user_id}", produces = "application/json")
    @ApiResponse(responseCode = "200", description = "List of users by id")
    @ApiResponse(responseCode = "401", description = "Token missing")
    @ApiResponse(responseCode = "403", description = "Token error")
    @SecurityRequirement(name = "studyeasy-demo-api")
    @Operation(summary = "List user by id api")
    public ResponseEntity<UsersByIdViewDTO> userById(@PathVariable long user_id, Authentication authentication) {
        String email = authentication.getName();
        Optional<Account> optionalAccount = accountService.findByEmail(email);
        if (optionalAccount.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        Optional<Users> optionalUsers = usersService.findById(user_id);
        if (optionalUsers.isPresent()) {
            Users user = optionalUsers.get();
            UsersByIdViewDTO usersByIdViewDTO = new UsersByIdViewDTO();
            usersByIdViewDTO.setId(user.getId());
            usersByIdViewDTO.setUserName(user.getUserName());
            usersByIdViewDTO.setName(user.getName());
            usersByIdViewDTO.setBio(user.getBio());
            usersByIdViewDTO.setPhoneNumber(user.getPhoneNumber());
            usersByIdViewDTO.setAddress(user.getAddress());

            Optional<Photo> optionalPhoto = photoService.findByUserId(user.getId());
            Optional<Photo> optionalPhoto2 = photoService.findByCoverUserId(user.getId());

            if (optionalPhoto.isPresent()) {
                Photo photo = optionalPhoto.get();
                String link2 = "/auth/users/" + user.getId() + "/profiles/download-photo";
                PhotoProfileDTO photoProfileDTO = new PhotoProfileDTO(photo.getId(), photo.getName(),
                        photo.getDescription(), photo.getFileName(), link2);
                usersByIdViewDTO.setPhotoProfile(photoProfileDTO);
            }

            if (optionalPhoto2.isPresent()) {
                Photo coverPhoto = optionalPhoto2.get();
                String link3 = "/auth/users/" + user.getId() + "/cover/download-photo";
                PhotoCoverDTO photoCoverDTO = new PhotoCoverDTO(coverPhoto.getId(), coverPhoto.getName(),
                        coverPhoto.getDescription(), coverPhoto.getFileName(), link3);
                usersByIdViewDTO.setCoverPhoto(photoCoverDTO);
            }

            return ResponseEntity.ok(usersByIdViewDTO);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    }

    @GetMapping(value = "/user/profileImage", produces = "application/json")
    @ApiResponse(responseCode = "200", description = "List of users")
    @ApiResponse(responseCode = "401", description = "Token missing")
    @ApiResponse(responseCode = "403", description = "Token error")
    @SecurityRequirement(name = "studyeasy-demo-api")
    @Operation(summary = "List user api")
    public List<UsersViewProfileDTO> userProfile() {
        List<UsersViewProfileDTO> users = new ArrayList<>();
        for (Users user : usersService.findAll()) {
            Optional<Photo> optionalPhoto = photoService.findByUserId(user.getId());
            if (optionalPhoto.isPresent()) {
                Photo photo = optionalPhoto.get();
                String link2 = "/auth/users/" + user.getId() + "/profiles" +
                        "/download-photo";
                PhotoProfileDTO photoProfileDTO = new PhotoProfileDTO(photo.getId(), photo.getName(),
                        photo.getDescription(), photo.getFileName(), link2);
                users.add(new UsersViewProfileDTO(user.getId(),user.getUserName(), user.getName(), photoProfileDTO));

            }
        }
        return users;
    }

    @GetMapping(value = "/profile", produces = "application/json")
    @ApiResponse(responseCode = "200", description = "View profile")
    @ApiResponse(responseCode = "401", description = "Token missing")
    @ApiResponse(responseCode = "403", description = "Token error")
    @SecurityRequirement(name = "studyeasy-demo-api")
    @Operation(summary = "View profile")
    public ProfileDTO profile(Authentication authentication) {
        String email = authentication.getName();
        Optional<Account> optionalAccount = accountService.findByEmail(email);
        Account account = optionalAccount.get();
        Optional<Photo> optionalPhoto = photoService.findByUserId(account.getUser().getId());
        Photo photo = optionalPhoto.get();
        String link2 = "/auth/users/" + account.getUser().getId() + "/profiles" +
                "/download-photo";
        PhotoProfileDTO photoProfileDTO = new PhotoProfileDTO(photo.getId(), photo.getName(),
                photo.getDescription(), photo.getFileName(), link2);
        ProfileDTO profileDTO = new ProfileDTO(account.getId(), account.getUser().getId(), account.getEmail(),
                account.getAuthorities(),
                account.getUser().getName(), account.getUser().getUserName(), photoProfileDTO);
        return profileDTO;

    }

    @PutMapping(value = "/users/{user_id}/update-authorities", produces = "application/json", consumes = "application/json")
    @ApiResponse(responseCode = "200", description = "Update authorities")
    @ApiResponse(responseCode = "401", description = "Token missing")
    @ApiResponse(responseCode = "400", description = "Invalid User Id")
    @ApiResponse(responseCode = "403", description = "Token Error")
    @Operation(summary = "Update authorities")
    @SecurityRequirement(name = "studyeasy-demo-api")
    public ResponseEntity<AccountViewDTO> update_auth(@Valid @RequestBody AuthoritiesDTO authoritiesDTO,
            @PathVariable long user_id) {
        Optional<Account> optionalAccount = accountService.findById(user_id);
        if (optionalAccount.isPresent()) {
            Account account = optionalAccount.get();
            account.setAuthorities(authoritiesDTO.getAuthorties());
            accountService.save(account);
            AccountViewDTO accountViewDTO = new AccountViewDTO(account.getId(), account.getEmail(),
                    account.getAuthorities());
            return ResponseEntity.ok(accountViewDTO);
        }
        return new ResponseEntity<AccountViewDTO>(new AccountViewDTO(), HttpStatus.BAD_REQUEST);
    }

    @PutMapping(value = "/profile/update-password", produces = "application/json", consumes = "application/json")
    @ApiResponse(responseCode = "200", description = "Update profile")
    @ApiResponse(responseCode = "401", description = "Token missing")
    @ApiResponse(responseCode = "403", description = "Token error")
    @SecurityRequirement(name = "studyeasy-demo-api")
    @Operation(summary = "Update profile")
    public AccountViewDTO update_password(@Valid @RequestBody PasswordDTO passwordDTO, Authentication authentication) {
        String email = authentication.getName();
        Optional<Account> optionalAccount = accountService.findByEmail(email);

        Account account = optionalAccount.get();
        account.setPassword(passwordDTO.getPassword());
        accountService.save(account);
        AccountViewDTO accountViewDTO = new AccountViewDTO(account.getId(), account.getEmail(),
                account.getAuthorities());
        return accountViewDTO;

    }

    @PostMapping(value = "/reset-password")
    @SecurityRequirement(name = "studyeasy-demo-api")
    @Operation(summary = "Reset password")
    public ResponseEntity<String> reset_password(@RequestParam("email") String email) {
        Optional<Account> optional_account = accountService.findByEmail(email);
        if (optional_account.isPresent()) {
            Account account = optional_account.get();
            String reset_token = UUID.randomUUID().toString();
            account.setPasswordResetToken(reset_token);
            account.setPassword_reset_token_expiry(LocalDateTime.now().plusMinutes(password_token_timeout));
            accountService.save(account);
            String reset_message = "This is the reset password link: " + site_domain + "change-password?token="
                    + reset_token;
            EmailDetail emailDetail = new EmailDetail(account.getEmail(), reset_message, "Instagram Reset password ");
            if (emailService.sendSimpleEmail(emailDetail)) {
                return ResponseEntity.ok("Email sent successfully");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending email");
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found");
        }
    }

    @PostMapping(value = "/change-password")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiResponse(responseCode = "400", description = "Please enter a Password length between 6 to 20 characters")
    @ApiResponse(responseCode = "200", description = "Password changed successfully")
    @ApiResponse(responseCode = "401", description = "Token missing")
    @Operation(summary = "Change password")
    public ResponseEntity<String> change_password(@RequestParam("token") String token,
            @RequestBody PasswordDTO passwordDTO) {
        if (token.equals("")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token không được rỗng");
        }
        Optional<Account> optional_account = accountService.findByToken(token);
        if (optional_account.isPresent()) {
            // Lấy tài khoản từ cơ sở dữ liệu dựa trên ID của tài khoản
            Account account = accountService.findById(optional_account.get().getId()).get();
            // Lấy thời gian hiện tại
            LocalDateTime now = LocalDateTime.now();
            if (now.isAfter(optional_account.get().getPassword_reset_token_expiry())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token đã hết hạn");
            }
            // Cập nhật mật khẩu mới cho tài khoản
            account.setPassword(passwordDTO.getPassword());
            account.setPasswordResetToken("");
            accountService.save(account);
            return ResponseEntity.ok("Thay đổi mật khẩu thành công");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tài khoản không tồn tại");
        }
    }

    // @PostMapping(value = "/change-password")
    // public ResponseEntity<String> updatePassword(@ModelAttribute Account
    // account){
    // // Kiểm tra xem tài khoản có tồn tại không
    // Account account_by_id =
    // accountService.findById(account.getId()).orElse(null);
    // if (account_by_id == null) {
    // return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tài khoản không tồn
    // tại");
    // }
    // // Cập nhật mật khẩu mới cho tài khoản
    // account_by_id.setPassword(account.getPassword());
    // account_by_id.setPasswordResetToken("");
    // accountService.save(account_by_id);
    // return ResponseEntity.ok("Mật khẩu đã được cập nhật thành công");
    // }

    @PutMapping(value = "/profile/update-profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ApiResponse(responseCode = "200", description = "Update profile")
    @ApiResponse(responseCode = "401", description = "Token missing")
    @ApiResponse(responseCode = "403", description = "Token error")
    @SecurityRequirement(name = "studyeasy-demo-api")
    @Operation(summary = "Update profile")
    public UsersViewDTO updateProfile(
            @Valid @RequestPart("usersDTO") UsersDTO usersDTO,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "file2", required = false) MultipartFile file2,
            Authentication authentication) throws IOException {

        String email = authentication.getName();
        Optional<Account> optionalAccount = accountService.findByEmail(email);
        if (!optionalAccount.isPresent()) {
            throw new UsernameNotFoundException("Account not found");
        }

        Users users = optionalAccount.get().getUser();
        users.setName(usersDTO.getName());
        users.setUserName(usersDTO.getUserName());
        users.setBio(usersDTO.getBio());
        users.setPhoneNumber(usersDTO.getPhoneNumber());
        users.setAddress(usersDTO.getAddress());

        if (file != null && !file.isEmpty() && file2 != null && !file2.isEmpty()) {
            String contentType = file.getContentType();
            String contentType2 = file2.getContentType();
            if ((contentType.equals("image/png") || contentType.equals("image/jpg") || contentType.equals("image/jpeg"))
                    &&
                    (contentType2.equals("image/png") || contentType2.equals("image/jpg")
                            || contentType2.equals("image/jpeg"))) {

                String fileName = file.getOriginalFilename();
                String fileName2 = file2.getOriginalFilename();
                String generatedString = RandomStringUtils.random(10, true, true);
                String finalImageName = generatedString + fileName;
                String finalImageName2 = generatedString + fileName2;

                String oldProfileImagePath = users.getProfileImage();
                String oldCoverImagePath = users.getCoverImage();

                try {
                    if (oldProfileImagePath != null) {
                        Files.deleteIfExists(Paths.get(oldProfileImagePath));
                    }
                    if (oldCoverImagePath != null) {
                        Files.deleteIfExists(Paths.get(oldCoverImagePath));
                    }
                } catch (IOException e) {
                    System.err.println("Không thể xóa ảnh cũ: " + e.getMessage());
                }

                String absoluteFileLocation = AppUtil.get_profile_photo_upload_path(finalImageName, PROFILES_FOL_STRING,
                        users.getId());
                String absoluteFileLocation2 = AppUtil.get_profile_photo_upload_path(finalImageName2, COVER_FOL_STRING,
                        users.getId());

                Path path = Paths.get(absoluteFileLocation);
                Path path2 = Paths.get(absoluteFileLocation2);
                try {
                    Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
                    Files.copy(file2.getInputStream(), path2, StandardCopyOption.REPLACE_EXISTING);
                } catch (IOException e) {
                    throw new IOException("Error saving new profile images");
                }

                users.setProfileImage(absoluteFileLocation);
                users.setCoverImage(absoluteFileLocation2);

                Photo profilePhoto = photoService.findByUserId(users.getId()).orElse(new Photo());
                profilePhoto.setName(fileName);
                profilePhoto.setFileName(finalImageName);
                profilePhoto.setOriginalFileName(fileName);
                profilePhoto.setUser(users);
                photoService.save(profilePhoto);

                Photo coverPhoto = photoService.findByCoverUserId(users.getId()).orElse(new Photo());
                coverPhoto.setName(fileName2);
                coverPhoto.setFileName(finalImageName2);
                coverPhoto.setOriginalFileName(fileName2);
                coverPhoto.setUsercover(users);
                photoService.save(coverPhoto);

            } else {
                throw new IllegalArgumentException("Unsupported file format. Please use PNG, JPG, or JPEG.");
            }
        }

        usersService.updateUserProfile(users);
        return new UsersViewDTO(users.getUserName(), users.getName(), users.getBio(), users.getPhoneNumber(), users.getAddress(), users.getProfileImage(), users.getCoverImage());
    }

    @DeleteMapping(value = "/profile/delete")
    @ApiResponse(responseCode = "200", description = "Delete profile")
    @ApiResponse(responseCode = "401", description = "Token missing")
    @ApiResponse(responseCode = "403", description = "Token error")
    @SecurityRequirement(name = "studyeasy-demo-api")
    @Operation(summary = "Delete profile")
    public ResponseEntity<String> delete_profile(Authentication authentication) {
        String email = authentication.getName();
        Optional<Account> optionalAccount = accountService.findByEmail(email);
        if (optionalAccount.isPresent()) {
            accountService.deleteById(optionalAccount.get().getId());
            return ResponseEntity.ok("User Deleted");
        }
        return new ResponseEntity<String>("Bad Request", HttpStatus.BAD_REQUEST);

    }

    @GetMapping("users/{user_id}/profiles/download-photo")
    @SecurityRequirement(name = "studyeasy-demo-api") // Yêu cầu bảo mật cho API
    public ResponseEntity<?> downloadProfilePhoto(@PathVariable("user_id") long user_id) {
        return downloadFile(user_id, PROFILES_FOL_STRING);
    }

    @GetMapping("users/{user_id}/cover/download-photo")
    @SecurityRequirement(name = "studyeasy-demo-api") // Yêu cầu bảo mật cho API
    public ResponseEntity<?> downloadCoverPhoto(@PathVariable("user_id") long user_id) {
        return downloadCoverFile(user_id, COVER_FOL_STRING);
    }

    public ResponseEntity<?> downloadFile(long user_id,
            String folder_name) {
        Optional<Photo> optionalPhoto = photoService.findByUserId(user_id);

        if (optionalPhoto.isPresent()) {
            Photo photo = optionalPhoto.get();
            Resource resource = null;
            try {
                resource = AppUtil.getFileAsResource(user_id, folder_name,
                        photo.getFileName());
            } catch (IOException e) {
                return ResponseEntity.internalServerError().build();
            }
            if (resource == null) {
                return new ResponseEntity<>("File not found", HttpStatus.NOT_FOUND);
            }
            String contentType = "application/octet-stream";
            String headerValue = "attachment; filename=\"" + photo.getOriginalFileName()
                    + "\"";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, headerValue)
                    .body(resource);
        } else {
            System.out.println("File not found");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    public ResponseEntity<?> downloadCoverFile(long user_id,
            String folder_name) {
        Optional<Photo> optionalPhoto = photoService.findByCoverUserId(user_id);

        if (optionalPhoto.isPresent()) {
            Photo photo = optionalPhoto.get();
            Resource resource = null;
            try {
                resource = AppUtil.getFileAsResource(user_id, folder_name,
                        photo.getFileName());
            } catch (IOException e) {
                return ResponseEntity.internalServerError().build();
            }
            if (resource == null) {
                return new ResponseEntity<>("File not found", HttpStatus.NOT_FOUND);
            }
            String contentType = "application/octet-stream";
            String headerValue = "attachment; filename=\"" + photo.getOriginalFileName()
                    + "\"";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, headerValue)
                    .body(resource);
        } else {
            System.out.println("File not found");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

}
