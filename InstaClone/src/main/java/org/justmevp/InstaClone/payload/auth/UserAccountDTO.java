package org.justmevp.InstaClone.payload.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserAccountDTO {
    @Email
    @Schema(description = "Email address", example = "a1@gmail.com", requiredMode = RequiredMode.REQUIRED)
    private String email;

    @Size(min = 6, max = 20)
    @Schema(description = "Password", example = "Password", requiredMode = RequiredMode.REQUIRED, maxLength = 20, minLength = 6)
    private String password;

    @Size(min = 3, max = 20)
    @Schema(description = "UserName", example = "justmeVP", requiredMode = RequiredMode.REQUIRED)
    private String userName;
    
    @Schema(description = "Real Name", example = "Trinh Viet Phuong", requiredMode = RequiredMode.REQUIRED)
    private String name;

}
