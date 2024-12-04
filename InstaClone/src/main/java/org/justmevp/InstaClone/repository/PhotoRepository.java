package org.justmevp.InstaClone.repository;

import java.util.List;
import java.util.Optional;

import org.justmevp.InstaClone.model.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
  List<Photo> findByPost_PostId(Long postId);

  Optional<Photo> findByUserId(long userId);

  Optional<Photo> findByUsercoverId(long usercoverId);

}
