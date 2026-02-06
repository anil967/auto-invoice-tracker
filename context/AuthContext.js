"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROLES } from "@/utils/auth";
import { startVersionCheck } from "@/lib/version";

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

        // Version checking enabled
        const cleanup = startVersionCheck(60000); // Check every 1 minute
        return cleanup;
    }, []);

    const login = (email, password) => {
        setIsLoading(true);

        // 1. Try to find user in our mock DB
        let storedUser = null;
        try {
            const usersDb = JSON.parse(localStorage.getItem("invoice_users_db") || "[]");
            storedUser = usersDb.find(u => u.email.toLowerCase() === email.toLowerCase());
        } catch (e) {
            console.error("Failed to read user db", e);
        }

        // 2. If found, use their role. If not, default to FINANCE_USER (demo fallback)
        const role = storedUser ? storedUser.role : ROLES.FINANCE_USER;
        const name = storedUser ? storedUser.name : email.split("@")[0];

        const newUser = {
            id: storedUser?.id || "usr_" + Math.random().toString(36).substr(2, 9),
            name: name,
            email,
            role: role,
            avatar: `https://i.pravatar.cc/150?u=${email}`,
        };

        // Save active session
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

        // 1. Save to Mock DB (Persistence)
        try {
            const usersDb = JSON.parse(localStorage.getItem("invoice_users_db") || "[]");
            // Remove existing if any (update)
            const filteredDb = usersDb.filter(u => u.email.toLowerCase() !== email.toLowerCase());
            filteredDb.push(newUser);
            localStorage.setItem("invoice_users_db", JSON.stringify(filteredDb));
        } catch (e) {
            console.error("Failed to save to user db", e);
        }

        // 2. Set Active Session
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
