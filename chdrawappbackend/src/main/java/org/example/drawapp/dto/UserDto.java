package org.example.drawapp.dto;

import org.example.drawapp.model.User;

public record UserDto(String id, String email) {

    public static UserDto from(User user) {
        return new UserDto(user.getId().toString(), user.getEmail());
    }
}
