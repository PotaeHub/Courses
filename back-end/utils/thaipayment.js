import generatePayload from "promptpay-qr";

export const createThaiQRPayload = ({
    promptpayId,
    amount,
}) => {
    return generatePayload(promptpayId, { amount });
};