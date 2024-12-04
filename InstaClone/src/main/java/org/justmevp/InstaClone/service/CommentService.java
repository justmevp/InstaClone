package org.justmevp.InstaClone.service;

import java.util.List;
import java.util.Optional;

import org.justmevp.InstaClone.model.Comment;

import org.justmevp.InstaClone.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    public Comment save(Comment comment) {
        return commentRepository.save(comment);
    }

     public List<Comment> findByPostId(long id){
        return commentRepository.findByPost_PostId(id); 
    }
    public  Optional<Comment> findById(long id){
        return commentRepository.findById(id);
    }

    public void delete(Comment comment) {
        commentRepository.delete(comment);
    }
}
