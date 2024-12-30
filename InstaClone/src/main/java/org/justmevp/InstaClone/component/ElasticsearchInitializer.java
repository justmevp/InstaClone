package org.justmevp.InstaClone.component;

import org.justmevp.InstaClone.model.Users;
import org.justmevp.InstaClone.repository.UsersRepository;
import org.justmevp.InstaClone.service.UserElasticSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ElasticsearchInitializer {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private UserElasticSearchService userSearchService;

    @EventListener(ApplicationReadyEvent.class)
    public void initializeElasticsearch() {
        List<Users> allUsers = usersRepository.findAll();
        userSearchService.indexAllUsers(allUsers);
    }
}
