package org.justmevp.InstaClone.service;

import java.util.List;
import java.util.stream.Collectors;

import org.justmevp.InstaClone.document.UserDocument;
import org.justmevp.InstaClone.model.Users;
import org.justmevp.InstaClone.repository.UserElasticSearchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserElasticSearchService {
    @Autowired
    private UserElasticSearchRepository userElasticSearchRepository;

    public void indexUser(Users user) {
        UserDocument document = UserDocument.builder()
                .id(user.getId())
                .userName(user.getUserName())
                .name(user.getName())
                .bio(user.getBio())
                .build();
                userElasticSearchRepository.save(document);
    }

    public List<UserDocument> searchUsers(String query) {
        return userElasticSearchRepository.findByUserNameContainingOrNameContaining(query, query);
    }

    public void indexAllUsers(List<Users> users) {
        List<UserDocument> documents = users.stream()
                .map(user -> UserDocument.builder()
                        .id(user.getId())
                        .userName(user.getUserName())
                        .name(user.getName())
                        .bio(user.getBio())
                        .build())
                .collect(Collectors.toList());
                userElasticSearchRepository.saveAll(documents);
    }

    public List<UserDocument> searchFollowedUsers(List<Long> userIds, String query) {
        // Tìm tất cả document có ID trong danh sách userIds
        List<UserDocument> followedUsers = userElasticSearchRepository.findByIdIn(userIds);
        
        // Lọc theo điều kiện userName hoặc name chứa query
        return followedUsers.stream()
                .filter(user -> 
                    (user.getUserName() != null && user.getUserName().toLowerCase().contains(query.toLowerCase())) ||
                    (user.getName() != null && user.getName().toLowerCase().contains(query.toLowerCase()))
                )
                .collect(Collectors.toList());
    }
}
