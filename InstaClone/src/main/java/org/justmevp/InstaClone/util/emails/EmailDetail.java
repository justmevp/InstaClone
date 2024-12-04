package org.justmevp.InstaClone.util.emails;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailDetail {
    private String recipient;
    private String msgBody;
    private String subject;
    
}
