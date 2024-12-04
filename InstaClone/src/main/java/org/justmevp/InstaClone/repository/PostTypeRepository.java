package org.justmevp.InstaClone.repository;

import java.util.Optional;

import org.justmevp.InstaClone.model.PostType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostTypeRepository  extends JpaRepository<PostType, Long> {

    Optional<PostType> findByPostTypeName(String postTypeName);
}
