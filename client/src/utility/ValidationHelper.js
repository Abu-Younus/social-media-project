class ValidationHelper {
    static IsOnlyLetters(value) {
        const OnlyLetterRegx = /^[A-Za-z'\s.,\-!@#$%^&*()[\]{}:;"<>?/+=_\\|`~]+$/;
        return OnlyLetterRegx.test(value);
    }

    static IsEmail(value) {
        const EmailRegx = /\S+@\S+\.\S+/;
        return EmailRegx.test(value);
    }

    static IsMobile(value) {
        const MobileRegx = /^(?:\+88|0088)?01[3456789]\d{8}$/;
        return MobileRegx.test(value);
    }

    static IsNumber(value) {
        const OnlyNumberRegx = /^\d+(\.\d+)?$/;
        return OnlyNumberRegx.test(value);
    }

    static IsNull(value) {
        return value === null;
    }

    static IsEmpty(value) {
        return value.length === 0;
    }

    static IsPassword(value) {
        // Password regex: At least 8 characters, 1 uppercase, 1 lowercase, 1 digit, 1 special character
        const PasswordRegx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return PasswordRegx.test(value);
    }
}

export default ValidationHelper;
