package org.justmevp.InstaClone.payload.auth.post;

import java.util.HashMap;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UploadResponseDTO {
    private List<HashMap<String, List<?>>> result;
    private PostViewDTO postDetails;
}
