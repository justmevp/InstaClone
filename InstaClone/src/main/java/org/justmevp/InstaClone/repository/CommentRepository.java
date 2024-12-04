package org.justmevp.InstaClone.repository;

import java.util.List;


import org.justmevp.InstaClone.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPost_PostId(Long id);
}
