// Dashboard Components - Central Export
// =====================================

// Layout Components
export { DashboardLayout, DashboardSection, DashboardGrid, PageHeader } from "./DashboardLayout";
export { Sidebar } from "./Sidebar";
export { DashboardHeader } from "./Header";

// Stats & Cards
export { StatCard, StatsGrid, MiniStat, defaultDashboardStats } from "./StatsCards";
export type { StatCardData } from "./StatsCards";

// Activity
export { ActivityFeed, sampleActivities } from "./ActivityFeed";
export type { ActivityItem, ActivityType } from "./ActivityFeed";

// Visualizations
export { default as DashboardScene } from "./DashboardScene";
export { default as SalesChart } from "./SalesChart";
export { default as VisitorFlowChart } from "./VisitorFlowChart";
