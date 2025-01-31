package org.justmevp.InstaClone.payload.auth.post;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PhotoPayloadDTO {

    @NotBlank
    @Schema(description = "Photo name", example = "Selfie", requiredMode = RequiredMode.REQUIRED)
    private String name;

    @NotBlank
    @Schema(description = "Description of the photo", example = "Description", requiredMode = RequiredMode.REQUIRED)
    private String description;
}
