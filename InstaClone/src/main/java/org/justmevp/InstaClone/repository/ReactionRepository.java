package org.justmevp.InstaClone.repository;
import java.util.List;
import java.util.Optional;
import org.justmevp.InstaClone.model.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    Optional<Reaction> findByPost_PostIdAndUserId(long postId, long userId);
    List<Reaction> findByPostPostId(long postId);
}
