package org.justmevp.InstaClone.service;

import java.util.List;
import java.util.Optional;  

import org.justmevp.InstaClone.model.Follower;
import org.justmevp.InstaClone.repository.FollowerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FollowerService {
    @Autowired
    private FollowerRepository followerRepository;;

    public Follower save(Follower follower) {
        return followerRepository.save(follower);
    }
    public void delete(Follower follower) {
        followerRepository.delete(follower);
    }

    public List<Follower> findByUserId(long id) {
        return followerRepository.findByUserId(id);
    }
    @Transactional
    public void deleteByUserIdAndFollowerId(long userId, long followerId) {
        followerRepository.deleteByUserIdAndFollowerId(userId, followerId);
    }

    public Optional<Follower> findByUserIdAndFollowerId(long userId, long followerId) {
       return followerRepository.findByUserIdAndFollowerId(userId, followerId);
    }
    public Follower findByFollowerId(long followerId) {
        return followerRepository.findByFollowerId(followerId);
    }

    public boolean isFollowing(long followerId, long userId) {
        return followerRepository.existsByFollowerIdAndUserId(followerId, userId);
    }
    
}
