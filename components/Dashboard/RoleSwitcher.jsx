"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, switchRole, ROLES } from "@/utils/auth";
import Icon from "@/components/Icon";

const RoleSwitcher = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        setUser(getCurrentUser());

        const handleAuthChange = () => {
            setUser(getCurrentUser());
        };

        window.addEventListener('auth-change', handleAuthChange);
        return () => window.removeEventListener('auth-change', handleAuthChange);
    }, []);

    if (!user) return null;

    // Hide in production
    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    return (
        <div className="flex items-center gap-2 p-1 bg-white/40 backdrop-blur-md rounded-full border border-white/60 shadow-sm">
            {Object.values(ROLES).map((role) => (
                <button
                    key={role}
                    onClick={() => switchRole(role)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1 ${user.role === role
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-gray-500 hover:bg-white/50"
                        }`}
                >
                    <Icon
                        name={
                            role === ROLES.ADMIN ? "Shield" :
                                role === ROLES.PROJECT_MANAGER ? "Briefcase" :
                                    role === ROLES.AUDITOR ? "Eye" :
                                        role === ROLES.FINANCE_MANAGER ? "Award" : "DollarSign"
                        }
                        size={12}
                    />
                    {role}
                </button>
            ))}
        </div>
    );
};

export default RoleSwitcher;
