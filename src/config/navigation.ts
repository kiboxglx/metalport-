import {
    LayoutGrid,
    Tags,
    ShoppingBag,
    CalendarRange,
    UsersRound,
    FileSignature,
    Wallet,
    ShieldCheck
} from "lucide-react";
import { View } from "../types";
import { UserRole } from "@/contexts/AuthContext";

export interface NavItem {
    id: View;
    label: string;
    icon: any; // Using any to avoid type conflicts with different icon libraries or versions
    path: string;
    allowedRoles: UserRole[]; // Empty array = all roles allowed
}

export const NAV_ITEMS: NavItem[] = [
    {
        id: View.DASHBOARD,
        label: "Dashboard",
        icon: LayoutGrid,
        path: "/dashboard",
        allowedRoles: [], // All roles
    },
    {
        id: View.PRODUCTS,
        label: "Produtos",
        icon: Tags,
        path: "/produtos",
        allowedRoles: [], // All roles
    },
    {
        id: View.RENTALS,
        label: "Aluguéis",
        icon: ShoppingBag,
        path: "/alugueis",
        allowedRoles: [], // All roles
    },
    {
        id: View.CALENDAR,
        label: "Calendário",
        icon: CalendarRange,
        path: "/calendario",
        allowedRoles: [], // All roles
    },
    {
        id: View.CLIENTS,
        label: "Clientes",
        icon: UsersRound,
        path: "/clientes",
        allowedRoles: ['admin', 'comercial'],
    },
    {
        id: View.CONTRACTS,
        label: "Contratos",
        icon: FileSignature,
        path: "/contratos",
        allowedRoles: ['admin', 'comercial'],
    },
    {
        id: View.FINANCE,
        label: "Financeiro",
        icon: Wallet,
        path: "/financeiro",
        allowedRoles: ['admin', 'comercial'],
    },
    {
        id: View.USERS,
        label: "Usuários",
        icon: ShieldCheck,
        path: "/usuarios",
        allowedRoles: ['admin'],
    },
];
