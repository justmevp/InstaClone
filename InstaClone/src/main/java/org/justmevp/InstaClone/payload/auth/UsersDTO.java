package org.justmevp.InstaClone.payload.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UsersDTO {

    @Schema(description = "UserName", example = "jusemeVP", requiredMode = RequiredMode.NOT_REQUIRED)
    private String userName;
    @Schema(description = "Real Name", example = "Trinh Viet Phuong", requiredMode = RequiredMode.NOT_REQUIRED)
	private String name;
    private String bio;
    private String phoneNumber;
    private String address;
    

}
