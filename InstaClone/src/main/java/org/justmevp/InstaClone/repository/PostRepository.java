package org.justmevp.InstaClone.repository;

import java.util.List;


import org.justmevp.InstaClone.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserIdOrderByDateTimeDesc(long id);

    List<Post> findAllByOrderByDateTimeDesc();
    

}
