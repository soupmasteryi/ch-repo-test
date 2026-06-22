package org.example.drawapp.validation;

import io.ipfs.multibase.Base58;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class WhiteboardCodeValidator implements ConstraintValidator<WhiteboardCode, String> {
    public static final int ID_START = 20_000_000;

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        try {
            return Base58.decodeToBigInteger(value).longValueExact() >= ID_START;
        } catch (Exception e) {
            return false;
        }
    }
}
