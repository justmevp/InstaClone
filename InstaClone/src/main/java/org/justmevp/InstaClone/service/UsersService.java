package org.justmevp.InstaClone.service;

import org.justmevp.InstaClone.document.UserDocument;
import org.justmevp.InstaClone.model.Account;
import org.justmevp.InstaClone.model.Users;
import org.justmevp.InstaClone.repository.AccountRepository;
import org.justmevp.InstaClone.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;



@Service
public class UsersService {
    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AccountService accountService;

    @Autowired
    private UserElasticSearchService userElasticSearchService;

    @Transactional
    public Users save(Users user) {
        // Kiểm tra nếu email đã tồn tại trong Account
        if (accountRepository.existsByEmail(user.getAccount().getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }

        // Gọi AccountService để lưu Account và mã hóa mật khẩu
        Account account = accountService.save(user.getAccount());

        // Liên kết Account với User và lưu User vào cơ sở dữ liệu
        user.setAccount(account);
        Users savedUser = usersRepository.save(user);
        
        // Index user in Elasticsearch
        userElasticSearchService.indexUser(savedUser);
        
        return savedUser;
    }

    public  Optional<Users> findById(long id) {
        return usersRepository.findById(id);
    }

    // public  List<Users> findUsersById(long id) {
    //     return usersRepository.findById(id);
    // }
     
    public  List<Users> findAll() {
        return usersRepository.findAll();
    }
    @Transactional
    public Users updateUserProfile(Users user) {
        return usersRepository.save(user);
    }

    public List<Users> searchUsers(String query) {
        // Search in Elasticsearch
        List<UserDocument> documents = userElasticSearchService.searchUsers(query);
        // Convert documents back to Users entities
        return documents.stream()
                .map(doc -> usersRepository.findById(doc.getId()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
    }
    
    /**
     * Tìm kiếm người dùng trong danh sách những người đang được follow
     * 
     * @param userId ID của người dùng đang thực hiện tìm kiếm
     * @param query  Từ khóa tìm kiếm
     * @return Danh sách người dùng phù hợp với từ khóa và đang được follow
     */
    public List<Users> searchFollowedUsers(long userId, String query) {
        // Bước 1: Lấy danh sách ID của tất cả người dùng đang được follow
        List<Long> followedUserIds = usersRepository.findFollowedUserIds(userId);
        
        // Bước 2: Sử dụng Elasticsearch để tìm kiếm trong danh sách người dùng đang follow
        // dựa trên từ khóa tìm kiếm
        List<UserDocument> searchResults = userElasticSearchService.searchFollowedUsers(followedUserIds, query);
        
        // Bước 3: Chuyển đổi kết quả từ UserDocument sang đối tượng Users
        return searchResults.stream()
                // Tìm thông tin chi tiết của từng người dùng từ database
                .map(doc -> usersRepository.findById(doc.getId()).orElse(null))
                // Loại bỏ các người dùng không tồn tại trong database
                .filter(Objects::nonNull)
                // Thu thập kết quả vào một danh sách
                .collect(Collectors.toList());
    }
}
