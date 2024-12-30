package org.justmevp.InstaClone.repository;

import java.util.List;

import org.justmevp.InstaClone.document.UserDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface UserElasticSearchRepository extends ElasticsearchRepository<UserDocument, Long> {
    List<UserDocument> findByUserNameContainingOrNameContaining(String userName, String name);
    
    List<UserDocument> findByIdIn(List<Long> ids);
    

}
