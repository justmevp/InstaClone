package org.justmevp.InstaClone.service;

import org.justmevp.InstaClone.model.Reaction;
import org.justmevp.InstaClone.repository.ReactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ReactionService {

    @Autowired
    private ReactionRepository reactionRepository;

    public Reaction save(Reaction reaction) {
        return reactionRepository.save(reaction);
    
    }

    public void delete(Reaction reaction) {
        reactionRepository.delete(reaction);
    }

    public List<Reaction> findByPostId(long postId) {
        return reactionRepository.findByPostPostId(postId);
    }

    public Optional<Reaction> findByPostIdAndUserId(long postId, long userId) {
        return reactionRepository.findByPost_PostIdAndUserId(postId, userId);
        
}
}
