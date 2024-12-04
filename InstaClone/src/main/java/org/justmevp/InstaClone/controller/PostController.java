package org.justmevp.InstaClone.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.apache.commons.lang3.RandomStringUtils;
import org.justmevp.InstaClone.model.Account;
import org.justmevp.InstaClone.model.Photo;
import org.justmevp.InstaClone.model.Post;
import org.justmevp.InstaClone.model.PostType;
import org.justmevp.InstaClone.model.Users;
import org.justmevp.InstaClone.payload.auth.post.PhotoDTO;
import org.justmevp.InstaClone.payload.auth.post.PostByUserDTO;
import org.justmevp.InstaClone.payload.auth.post.PostPayloadDTO;
import org.justmevp.InstaClone.payload.auth.post.AllPostViewDTO;
import org.justmevp.InstaClone.payload.auth.post.PostViewDTO;
import org.justmevp.InstaClone.service.AccountService;
import org.justmevp.InstaClone.service.PhotoService;
import org.justmevp.InstaClone.service.PostService;
import org.justmevp.InstaClone.service.PostTypeService;
import org.justmevp.InstaClone.util.AppUtils.AppUtil;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
// @CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
@Tag(name = "Post Controller", description = "Controller for Post management")
@Slf4j
public class PostController {

    static final String PHOTOS_FOLDER_NAME = "photos";
    static final String THUMBNAIL_FOLDER_NAME = "thumbnails";
    static final int THUMBNAIL_WIDTH = 300;
    

    @Autowired
    private AccountService accountService;

    @Autowired
    private PhotoService photoService;

    @Autowired
    private PostService postService;

    @Autowired
    private PostTypeService postTypeService;


    @PostMapping(value = "/posts/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @ApiResponse(responseCode = "400", description = "Please check the payload or token")
    @ApiResponse(responseCode = "200", description = "Post added with image")
    @Operation(summary = "Add a new Post with optional image")
    @SecurityRequirement(name = "studyeasy-demo-api")
    public ResponseEntity<?> addPostWithImage(
            @Parameter(content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)) @RequestPart("post") PostPayloadDTO postPayloadDTO,
            @RequestPart(value = "file", required = false) MultipartFile file,
            
            Authentication authentication) {
        try {
            // Xác thực email và người dùng
            String email = authentication.getName();
            Optional<Account> optionalAccount = accountService.findByEmail(email);
            Users users = optionalAccount.get().getUser();
            Post post = new Post();
            post.setUser(users);
            post.setCaption(postPayloadDTO.getCaption());
            PostType postType = postTypeService.getPostTypeByName(postPayloadDTO.getPostTypeName());
            post.setPostType(postType);
            postService.save(post);
            if (file != null && !file.isEmpty()) {
                String contentType = file.getContentType();
                if (contentType.equals("image/png") || contentType.equals("image/jpg")
                        || contentType.equals("image/jpeg")) {
                    String fileName = file.getOriginalFilename();
                    String generatedString = RandomStringUtils.random(10, true, true);
                    String finalImageName = generatedString + fileName;
                    String absoluteFileLocation = AppUtil.get_photo_upload_path(finalImageName, PHOTOS_FOLDER_NAME,
                            post.getPostId());

                    Path path = Paths.get(absoluteFileLocation);
                    Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

                    post.setPostImgURL(absoluteFileLocation); // Lưu đường dẫn ảnh vào post
                    // Tạo đối tượng Photo và lưu thông tin file vào cơ sở dữ liệu
                    Photo photo = new Photo();
                    photo.setName(fileName); // Lưu tên gốc của file
                    photo.setFileName(finalImageName); // Lưu tên file sau khi thêm chuỗi ngẫu nhiên
                    photo.setOriginalFileName(fileName); // Lưu tên file gốc
                    photo.setPost(post); // Liên kết ảnh với album
                    photoService.save(photo); // Lưu ảnh vào database
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Unsupported file format. Please use PNG, JPG, or JPEG.");
                }
            }
            List<PhotoDTO> photos = new ArrayList<>();
            for (Photo photo : photoService.findByPostId(post.getPostId())) {
                String link = "/posts/" + post.getPostId() + "/photos/" + photo.getId() +
                        "/download-photo";
                photos.add(new PhotoDTO(photo.getId(), photo.getName(),
                        photo.getDescription(), photo.getFileName(),
                        link));
            }
            // Lưu post vào database
            post = postService.save(post);
            PostViewDTO postViewDTO = new PostViewDTO(post.getPostId(), post.getUser().getProfileImage(),
                    post.getCaption(), post.getUser().getUserName(), photos);
            return ResponseEntity.ok(postViewDTO);

        } catch (Exception e) {
            log.debug("Error adding post with image: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // @GetMapping(value = "/posts/{user_}", produces = "application/json")
    // @ApiResponse(responseCode = "200", description = "List of posts")
    // @ApiResponse(responseCode = "401", description = "Token missing")
    // @ApiResponse(responseCode = "403", description = "Token error")
    // @SecurityRequirement(name = "studyeasy-demo-api")
    // @Operation(summary = "List post api")
    // public List<PostViewDTO> postsByUser(Authentication authentication) {

    // String email = authentication.getName();
    // Optional<Account> optionalAccount = accountService.findByEmail(email);
    // Users user = optionalAccount.get().getUser();
    // List<PostViewDTO> posts = new ArrayList<>();
    // for (Post post : postService.findByUserId(user.getId())) {

    // List<PhotoDTO> photos = new ArrayList<>();
    // for (Photo photo : photoService.findByPostId(post.getPostId())) {
    // String link = "/posts/" + post.getPostId() + "/photos/" + photo.getId() +
    // "/download-photo";
    // photos.add(new PhotoDTO(photo.getId(), photo.getName(),
    // photo.getDescription(), photo.getFileName(),
    // link));
    // }
    // posts.add(new PostViewDTO(post.getPostId(), post.getCaption(),
    // photos));

    // }
    // return posts;

    // }

    @GetMapping(value = "/posts", produces = "application/json")
    @ApiResponse(responseCode = "200", description = "List of posts")
    @ApiResponse(responseCode = "401", description = "Token missing")
    @ApiResponse(responseCode = "403", description = "Token error")
    @SecurityRequirement(name = "studyeasy-demo-api")
    @Operation(summary = "List post api")
    public List<AllPostViewDTO> posts() {

        List<AllPostViewDTO> posts = new ArrayList<>();
        for (Post post : postService.findAll()) {

            List<PhotoDTO> photos = new ArrayList<>();
            for (Photo photo : photoService.findByPostId(post.getPostId())) {
                String link = "/posts/" + post.getPostId() + "/photos/" + photo.getId() +
                        "/download-photo";
                photos.add(new PhotoDTO(photo.getId(), photo.getName(),
                        photo.getDescription(), photo.getFileName(),
                        link));
            }
            posts.add(new AllPostViewDTO(post.getPostId(), post.getUser().getId(), post.getUser().getProfileImage(), post.getCaption(),
                    post.getUser().getUserName(),post.getDateTime(),photos));
        }
        return posts;
    }

    @GetMapping(value = "user/{user_id}/posts", produces = "application/json")
    @ApiResponse(responseCode = "200", description = "List of posts")
    @ApiResponse(responseCode = "401", description = "Token missing")
    @ApiResponse(responseCode = "403", description = "Token error")
    @SecurityRequirement(name = "studyeasy-demo-api")
    @Operation(summary = "List post api by user")
    public ResponseEntity<List<PostByUserDTO>> postsByUser(@PathVariable long user_id, Authentication authentication) {
        List<PostByUserDTO> posts = new ArrayList<>();
        for (Post post : postService.findByUserId(user_id)) {
            List<PhotoDTO> photos = new ArrayList<>();
            for (Photo photo : photoService.findByPostId(post.getPostId())) {
                String link = "/posts/" + post.getPostId() + "/photos/" + photo.getId() +
                        "/download-photo";
                photos.add(new PhotoDTO(photo.getId(), photo.getName(),
                        photo.getDescription(), photo.getFileName(),
                        link));
            }
            posts.add(new PostByUserDTO(post.getPostId(), post.getUser().getProfileImage(), post.getCaption(),
                    post.getUser().getUserName(),post.getDateTime(),photos));
        }
        return ResponseEntity.ok(posts);

    }

    @GetMapping(value = "/posts/{posts_id}", produces = "application/json")
    @ApiResponse(responseCode = "200", description = "List of posts")
    @ApiResponse(responseCode = "401", description = "Token missing")
    @ApiResponse(responseCode = "403", description = "Token error")
    @SecurityRequirement(name = "studyeasy-demo-api")
    @Operation(summary = "List post api")
    public ResponseEntity<PostViewDTO> posts_by_id(@PathVariable long post_id,
            Authentication authentication) {

        Optional<Post> optionalPost = postService.findById(post_id);
        Post post;
        if (optionalPost.isPresent()) {
            post = optionalPost.get();
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        List<PhotoDTO> photos = new ArrayList<>();
        for (Photo photo : photoService.findByPostId(post.getPostId())) {
            String link = "/posts/" + post.getPostId() + "/photos/" + photo.getId() +
                    "/download-photo";
            photos.add(new PhotoDTO(photo.getId(), photo.getName(),
                    photo.getDescription(), photo.getFileName(),
                    link));
        }
        PostViewDTO postViewDTO = new PostViewDTO(post.getPostId(), post.getUser().getProfileImage(), post.getCaption(),
                post.getUser().getUserName(),
                photos);
        return ResponseEntity.ok(postViewDTO);

    }

    // @GetMapping("/base64/{filename}")
    // public ResponseEntity<String> getPhotoBase64(@PathVariable String filename) {
    //     try {
    //         Path filePath = Paths.get("path/to/photos").resolve(filename).normalize();
    //         byte[] imageBytes = Files.readAllBytes(filePath);
    //         String base64Image = Base64.getEncoder().encodeToString(imageBytes); // Chuyển ảnh thành base64
    //         return ResponseEntity.ok("data:image/jpeg;base64," + base64Image);
    //     } catch (Exception e) {
    //         e.printStackTrace();
    //         return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    // @PostMapping(value = "posts/{post_id}/upload-photos", consumes =
    // MediaType.MULTIPART_FORM_DATA_VALUE)
    // @Operation(summary = "Upload photo into Post")
    // @ApiResponse(responseCode = "400", description = "Please check the payload or
    // token")
    // @SecurityRequirement(name = "studyeasy-demo-api")
    // public ResponseEntity<UploadResponseDTO> photos(
    // @RequestPart("caption") PostPayloadDTO postPayloadDTO, // Nhận caption dưới
    // dạng chuỗi
    // @RequestParam(value = "file",required = false) MultipartFile files,
    // @PathVariable long post_id,
    // Authentication authentication) {

    // // Xác thực email và người dùng
    // String email = authentication.getName();
    // Optional<Account> optionalAccount = accountService.findByEmail(email);
    // Users users = optionalAccount.get().getUser();
    // Post post = new Post();
    // post.setUser(users);
    // post.setCaption(postPayloadDTO.getCaption());

    // List<PhotoViewDTO> fileNamesWithSuccess = new ArrayList<>();
    // List<String> fileNamesWithError = new ArrayList<>();

    // Arrays.asList(files).forEach(file -> {
    // String contentType = file.getContentType();
    // if (contentType.equals("image/png") || contentType.equals("image/jpg")
    // || contentType.equals("image/jpeg")) {
    // int length = 10;
    // boolean useLetters = true;
    // boolean useNumbers = true;
    // try {
    // String fileName = file.getOriginalFilename();
    // String generatedString = RandomStringUtils.random(length, useLetters,
    // useNumbers);
    // String final_photo_name = generatedString + fileName;
    // String absolute_fileLocation =
    // AppUtil.get_photo_upload_path(final_photo_name, PHOTOS_FOLDER_NAME,
    // post_id);

    // Path path = Paths.get(absolute_fileLocation);
    // Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

    // Photo photo = new Photo();
    // photo.setName(fileName);
    // photo.setFileName(final_photo_name);
    // photo.setOriginalFileName(fileName);
    // photo.setPost(post);
    // post.setPostImgURL(absolute_fileLocation);
    // photoService.save(photo);
    // postService.save(post);

    // PhotoViewDTO photoViewDTO = new PhotoViewDTO(photo.getId(), photo.getName(),
    // photo.getDescription());
    // fileNamesWithSuccess.add(photoViewDTO);

    // BufferedImage thumbImg = AppUtil.getThumbnail(file, THUMBNAIL_WIDTH);
    // File thumbnail_location = new File(
    // AppUtil.get_photo_upload_path(final_photo_name, THUMBNAIL_FOLDER_NAME,
    // post_id));
    // ImageIO.write(thumbImg, file.getContentType().split("/")[1],
    // thumbnail_location);

    // } catch (Exception e) {
    // log.debug(AlbumError.PHOTO_UPLOAD_ERROR.toString() + ": " + e.getMessage());
    // fileNamesWithError.add(file.getOriginalFilename());
    // }
    // } else {
    // fileNamesWithError.add(file.getOriginalFilename());
    // }
    // });

    // HashMap<String, List<?>> result = new HashMap<>();
    // result.put("SUCCESS", fileNamesWithSuccess);
    // result.put("ERRORS", fileNamesWithError);

    // List<HashMap<String, List<?>>> response = new ArrayList<>();
    // response.add(result);
    // PostViewDTO postViewDTO = new PostViewDTO(post.getPostId(),
    // post.getCaption(), post.getPostImgURL());

    // // Sử dụng DTO để chứa cả response và postViewDTO
    // UploadResponseDTO uploadResponse = new UploadResponseDTO(response,
    // postViewDTO);

    // return ResponseEntity.ok(uploadResponse);
    // }

   

    // @GetMapping("albums/{album_id}/photos/{photo_id}/download-thumbnail")
    // @SecurityRequirement(name = "studyeasy-demo-api") // Yêu cầu bảo mật cho API
    // public ResponseEntity<?> downloadThumbnail(@PathVariable("album_id") long
    // album_id,
    // @PathVariable("photo_id") long photo_id, Authentication authentication) {
    // return downloadFile(album_id, photo_id, THUMBNAIL_FOLDER_NAME,
    // authentication);
    // }

    @PutMapping(value = "/posts/{postId}/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "400", description = "Please check the payload or token")
    @ApiResponse(responseCode = "200", description = "Post updated with image")
    @Operation(summary = "Update an existing Post with optional new image")
    @SecurityRequirement(name = "studyeasy-demo-api")
    public ResponseEntity<?> updatePostWithImage(
            @PathVariable("postId") Long postId,
            @RequestPart("caption") PostPayloadDTO postPayloadDTO, // Nhận caption mới
            @RequestPart(value = "file", required = false) MultipartFile file, // Nhận file ảnh mới tùy chọn
            Authentication authentication) {

        try {
            // Xác thực người dùng và lấy bài viết
            String email = authentication.getName();
            Optional<Account> optionalAccount = accountService.findByEmail(email);
            if (optionalAccount.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access.");
            }

            Optional<Post> optionalPost = postService.findById(postId);
            if (optionalPost.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found.");
            }

            Post post = optionalPost.get();
            if (!post.getUser().getAccount().getEmail().equals(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed to update this post.");
            }

            // Cập nhật caption nếu có
            post.setCaption(postPayloadDTO.getCaption());

            // Xóa ảnh cũ và cập nhật ảnh mới nếu có
            if (file != null && !file.isEmpty()) {
                String contentType = file.getContentType();
                if (contentType.equals("image/png") || contentType.equals("image/jpg")
                        || contentType.equals("image/jpeg")) {
                    String fileName = file.getOriginalFilename();
                    String generatedString = RandomStringUtils.random(10, true, true);
                    String finalImageName = generatedString + fileName;
                    String absoluteFileLocation = AppUtil.get_photo_upload_path(finalImageName, PHOTOS_FOLDER_NAME,
                            post.getPostId());

                    // Xóa ảnh cũ từ file hệ thống nếu cần
                    if (post.getPostImgURL() != null) {
                        Files.deleteIfExists(Paths.get(post.getPostImgURL()));
                    }

                    // Lưu ảnh mới
                    Path path = Paths.get(absoluteFileLocation);
                    Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

                    post.setPostImgURL(absoluteFileLocation);

                    // Tạo đối tượng Photo mới và cập nhật vào cơ sở dữ liệu
                    Photo photo = new Photo();
                    photo.setName(fileName);
                    photo.setFileName(finalImageName);
                    photo.setOriginalFileName(fileName);
                    photo.setPost(post);
                    photoService.save(photo);
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Unsupported file format. Please use PNG, JPG, or JPEG.");
                }
            }

            // Cập nhật bài viết và trả về
            post = postService.save(post);
            List<PhotoDTO> photos = new ArrayList<>();
            for (Photo photo : photoService.findByPostId(post.getPostId())) {
                String link = "/posts/" + post.getPostId() + "/photos/" + photo.getId() + "/download-photo";
                photos.add(new PhotoDTO(photo.getId(), photo.getName(), photo.getDescription(), photo.getFileName(),
                        link));
            }

            PostViewDTO postViewDTO = new PostViewDTO(post.getPostId(), post.getUser().getProfileImage(),
                    post.getCaption(), post.getUser().getUserName(), photos);
            return ResponseEntity.ok(postViewDTO);

        } catch (Exception e) {
            log.debug("Error updating post with image: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to update post.");
        }
    }

    @DeleteMapping(value = "/posts/{post_id}/delete")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiResponse(responseCode = "202", description = "Album Post")
    @Operation(summary = "Delete a post")
    @SecurityRequirement(name = "studyeasy-demo-api")
    public ResponseEntity<String> delete_post(@PathVariable long post_id,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Optional<Account> optionalAccount = accountService.findByEmail(email);
            Users users = optionalAccount.get().getUser();
            Optional<Post> optionalPost = postService.findById(post_id);
            Post post;

            if (optionalPost.isPresent()) {
                post = optionalPost.get();
                if (users.getId() != post.getUser().getId()) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
                }
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }
            for (Photo photo : photoService.findByPostId(post.getPostId())) {
                AppUtil.delete_photo_from_path(photo.getFileName(), PHOTOS_FOLDER_NAME,
                        post_id);
                AppUtil.delete_photo_from_path(photo.getFileName(), THUMBNAIL_FOLDER_NAME,
                        post_id);
                photoService.delete(photo);
            }
            postService.delete(post);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(null);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("posts/{post_id}/photos/{photo_id}/download-photo")
    @SecurityRequirement(name = "studyeasy-demo-api") // Yêu cầu bảo mật cho API
    public ResponseEntity<?> downloadPhoto(@PathVariable("post_id") long
    post_id,
    @PathVariable("photo_id") long photo_id) {
    return downloadFile(post_id, photo_id, PHOTOS_FOLDER_NAME);
    }

    public ResponseEntity<?> downloadFile(long post_id,
            long photo_id, String folder_name) {
        Optional<Photo> optionalPhoto = photoService.findById(photo_id);
        if (optionalPhoto.isPresent()) {
            Photo photo = optionalPhoto.get();
            Resource resource = null;
            try {
                resource = AppUtil.getFileAsResource(post_id, folder_name,
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
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

}
