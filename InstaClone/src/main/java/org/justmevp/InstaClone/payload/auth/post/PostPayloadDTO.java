package org.justmevp.InstaClone.payload.auth.post;



import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Data
public class PostPayloadDTO {

    @NotBlank
    @Schema(description = "Caption", example = "Messi", requiredMode = RequiredMode.REQUIRED)
    private String caption;

    private String postTypeName;
    
}
