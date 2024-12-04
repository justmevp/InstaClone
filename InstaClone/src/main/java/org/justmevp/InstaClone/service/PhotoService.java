package org.justmevp.InstaClone.service;

import java.util.List;
import java.util.Optional;

import org.justmevp.InstaClone.model.Photo;
import org.justmevp.InstaClone.repository.PhotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
@Service
public class PhotoService {

    @Autowired
    private PhotoRepository photoRepository;

    public Photo save(Photo photo){
        return photoRepository.save(photo);
    }
    public Optional<Photo> findById(long id){
        return photoRepository.findById(id);
    }

    public Optional<Photo> findByUserId(long id){
        return photoRepository.findByUserId(id);
    }

    public Optional<Photo> findByCoverUserId(long id){
        return photoRepository.findByUsercoverId(id);
    }
    
    
    public List<Photo> findByPostId(long id){
        return photoRepository.findByPost_PostId(id); 
    }
    public void delete(Photo photo){
        photoRepository.delete(photo);
    }
    
}
