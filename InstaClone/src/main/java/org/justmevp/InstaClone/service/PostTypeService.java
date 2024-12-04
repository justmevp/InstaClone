package org.justmevp.InstaClone.service;



import org.justmevp.InstaClone.model.PostType;
import org.justmevp.InstaClone.repository.PostTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PostTypeService {
    @Autowired
    private PostTypeRepository postTypeRepository;

    public PostType getPostTypeByName(String postTypeName) {
        return postTypeRepository.findByPostTypeName(postTypeName)
                .orElseThrow(() -> new IllegalArgumentException("Invalid post type. Allowed values are: normal, story, reels."));
    }
    
}
