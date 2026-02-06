"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROLES } from "@/utils/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Load user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem("invoice_user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (email, password, role = ROLES.FINANCE_USER) => {
        // Simulate API call
        setIsLoading(true);

        // For demo: Accept any email/password, but use the selected role
        const newUser = {
            id: "usr_" + Math.random().toString(36).substr(2, 9),
            name: email.split("@")[0], // Derive name from email
            email,
            role: role,
            avatar: `https://i.pravatar.cc/150?u=${email}`,
        };

        localStorage.setItem("invoice_user", JSON.stringify(newUser));
        setUser(newUser);
        setIsLoading(false);

        // Redirect to dashboard
        router.push("/dashboard");
    };

    const signup = (name, email, password, role = ROLES.FINANCE_USER) => {
        setIsLoading(true);

        const newUser = {
            id: "usr_" + Math.random().toString(36).substr(2, 9),
            name,
            email,
            role,
            avatar: `https://i.pravatar.cc/150?u=${email}`,
        };

        localStorage.setItem("invoice_user", JSON.stringify(newUser));
        setUser(newUser);
        setIsLoading(false);
        router.push("/dashboard");
    };

    const logout = () => {
        localStorage.removeItem("invoice_user");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
