package org.justmevp.InstaClone.repository;
import java.util.List;
import java.util.Optional;
import org.justmevp.InstaClone.model.Follower;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FollowerRepository extends JpaRepository<Follower, Long> {
List<Follower> findByUserId(long id);

Optional<Follower> deleteByUserIdAndFollowerId(long userId, long followerId);

Optional<Follower> findByUserIdAndFollowerId(long userId, long followerId);

Follower findByFollowerId(long followerId);

boolean existsByFollowerIdAndUserId(long followerId, long userId);

}
