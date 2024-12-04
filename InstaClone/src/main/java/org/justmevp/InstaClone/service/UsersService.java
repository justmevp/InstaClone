package org.justmevp.InstaClone.service;

import org.justmevp.InstaClone.model.Account;
import org.justmevp.InstaClone.model.Users;
import org.justmevp.InstaClone.repository.AccountRepository;
import org.justmevp.InstaClone.repository.UsersRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UsersService {
    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AccountService accountService;

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
        return usersRepository.save(user);
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
        return usersRepository.searchUsers(query);
    }
    
    public List<Users> searchFollowedUsers(long userId, String query) {
        return usersRepository.searchFollowedUsers(userId, query);
    }
    

}
