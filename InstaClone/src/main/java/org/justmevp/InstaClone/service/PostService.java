package org.justmevp.InstaClone.service;


import java.util.List;
import java.util.Optional;

import org.justmevp.InstaClone.model.Post;
import org.justmevp.InstaClone.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PostService {
      @Autowired
    private PostRepository postRepository;

      public Optional<Post> findById(long id){
        return postRepository.findById(id);
    }

    public List<Post> findAll(){
        return postRepository.findAllByOrderByDateTimeDesc();
    }

    public Post save(Post post){
        return postRepository.save(post);
    }

     public List<Post> findByUserId(long id){
        return postRepository.findByUserIdOrderByDateTimeDesc(id);
    }

     public void delete(Post post){
        postRepository.delete(post);
    }
}
