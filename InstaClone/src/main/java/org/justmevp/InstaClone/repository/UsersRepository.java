package org.justmevp.InstaClone.repository;

import java.util.List;

import org.justmevp.InstaClone.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface UsersRepository extends JpaRepository<Users, Long>{
    // List<Users> findById(long id);

      // Search users by name or username
    @Query("SELECT u FROM Users u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.userName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Users> searchUsers(@Param("query") String query);

    // Search only followed users
    @Query("SELECT u FROM Users u " +
           "JOIN Follower f ON f.user.id = u.id " +
           "WHERE f.follower.id = :userId " +
           "AND (LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.userName) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Users> searchFollowedUsers(@Param("userId") long userId, @Param("query") String query);

}
