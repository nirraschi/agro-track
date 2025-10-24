import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({children}) {
    const navigate = useNavigate();
    const { session, loading } = useAuth();

    useEffect(() => {
        if (!loading && !session){
            navigate("/login");
        }
    }, [loading, session, navigate]);

    if (loading) {
        return <div>Loading...</div>
    }

    return session ? children : null;
    
}