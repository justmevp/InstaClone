package org.justmevp.InstaClone.repository;

import java.util.Optional;

import org.justmevp.InstaClone.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByEmail(String email);

    boolean existsByEmail(String email);
    
    Optional<Account> findOneByEmailIgnoreCase(String email);

    Optional<Account> findByPasswordResetToken(String token);
}
