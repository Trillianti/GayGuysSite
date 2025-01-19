import { useState, useEffect } from 'react';

const SignatureBlock = () => {
    const [userBlocks, setUserBlocks] = useState(null);

    useEffect(() => {
        const fetchSignatureBlock = async () => {
            try {
                const response = await axios.post(
                "http://localhost:50001/get-quotes",
                );
                return response.data; // Возвращаем данные пользователя
            } catch (error) {
                console.error("Ошибка сервера:", error);
                return null;
            }
        };

        
    }, [])
    return (
        <>
        
        </>
    )
}

export default SignatureBlock;