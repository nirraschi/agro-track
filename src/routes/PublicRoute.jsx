import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function PublicRoute({ children }) {
    const { session, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if(!loading && session) {
            navigate('/');

        }
    }, [session, loading, navigate]);

    if (loading) return <div>Loading...</div>

    return !session ? children : null;
}