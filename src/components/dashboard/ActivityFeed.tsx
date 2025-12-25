"use client";

import { motion } from "framer-motion";
import {
  ShoppingCart,
  CreditCard,
  Package,
  User,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

export type ActivityType =
  | "order"
  | "payment"
  | "shipment"
  | "customer"
  | "review"
  | "alert"
  | "success"
  | "pending";

export type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  time: string;
  metadata?: Record<string, any>;
};

const activityConfig: Record<
  ActivityType,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  order: {
    icon: ShoppingCart,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400",
  },
  payment: {
    icon: CreditCard,
    color: "text-blue-400",
    bgColor: "bg-blue-400",
  },
  shipment: {
    icon: Package,
    color: "text-purple-400",
    bgColor: "bg-purple-400",
  },
  customer: {
    icon: User,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400",
  },
  review: {
    icon: Star,
    color: "text-amber-400",
    bgColor: "bg-amber-400",
  },
  alert: {
    icon: AlertTriangle,
    color: "text-red-400",
    bgColor: "bg-red-400",
  },
  success: {
    icon: CheckCircle,
    color: "text-green-400",
    bgColor: "bg-green-400",
  },
  pending: {
    icon: Clock,
    color: "text-orange-400",
    bgColor: "bg-orange-400",
  },
};

type ActivityItemComponentProps = {
  activity: ActivityItem;
  index?: number;
};

function ActivityItemComponent({
  activity,
  index = 0,
}: ActivityItemComponentProps) {
  const config = activityConfig[activity.type];
  const Icon = config.icon as React.ComponentType<{ className?: string }>;

  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-start gap-3 group cursor-pointer hover:bg-neutral-800/30 rounded-lg p-2 -mx-2 transition-colors"
    >
      {/* Animated dot */}
      <span className="relative mt-1.5 flex h-2.5 w-2.5 flex-shrink-0">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.bgColor} opacity-75`}
        />
        <span
          className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.bgColor}`}
        />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 ${config.color} flex-shrink-0`} />
          <span className="text-[13px] text-neutral-100 truncate">
            {activity.title}
          </span>
        </div>
        <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
          {activity.subtitle}
        </p>
      </div>

      {/* Time */}
      <span className="text-[10px] text-neutral-600 flex-shrink-0">
        {activity.time}
      </span>
    </motion.li>
  );
}

type ActivityFeedProps = {
  activities: ActivityItem[];
  title?: string;
  subtitle?: string;
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
};

export function ActivityFeed({
  activities,
  title = "Recent Activity",
  subtitle = "Latest updates across your store",
  maxItems = 5,
  showViewAll = true,
  onViewAll,
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-xl p-4 flex flex-col hover:border-emerald-500/30 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-medium text-neutral-200">{title}</div>
          <div className="text-xs text-neutral-500">{subtitle}</div>
        </div>
        {showViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View all
          </button>
        )}
      </div>

      {/* Activity List */}
      <ul className="space-y-2 flex-1">
        {displayedActivities.map((activity, index) => (
          <ActivityItemComponent
            key={activity.id}
            activity={activity}
            index={index}
          />
        ))}
      </ul>

      {/* Empty state */}
      {activities.length === 0 && (
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="text-center">
            <Clock className="h-8 w-8 text-neutral-700 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">No recent activity</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Sample data for testing
export const sampleActivities: ActivityItem[] = [
  {
    id: "1",
    type: "order",
    title: "New order #1234",
    subtitle: '"Morocco Streetwear" just finished setup.',
    time: "2m ago",
  },
  {
    id: "2",
    type: "payment",
    title: "Payment received",
    subtitle: "$420 from customer in Dubai",
    time: "15m ago",
  },
  {
    id: "3",
    type: "shipment",
    title: "Order shipped",
    subtitle: "Order #1230 is on its way",
    time: "1h ago",
  },
  {
    id: "4",
    type: "customer",
    title: "New customer",
    subtitle: "Ahmed from Casablanca signed up",
    time: "2h ago",
  },
  {
    id: "5",
    type: "alert",
    title: "Low stock alert",
    subtitle: "Product X is running low (5 left)",
    time: "3h ago",
  },
];
