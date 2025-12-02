import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { StatusCheck } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}

export function calculateOverallUptime(checks: StatusCheck[]): number {
  if (!checks || checks.length === 0) return 100;
  const upChecks = checks.filter((check) => check.status === 'up').length;
  return Math.round((upChecks / checks.length) * 100);
}

export interface GroupedService {
  name: string;
  subGroups: {
    name: string;
    services: StatusCheck[];
  }[];
}

export function groupAndSortServices(services: StatusCheck[]): GroupedService[] {
  // 1. Group by Group -> SubGroup
  const groups: Record<string, Record<string, StatusCheck[]>> = {};
  const groupMinOrder: Record<string, number> = {};
  const subGroupMinOrder: Record<string, Record<string, number>> = {};

  services.forEach(service => {
    const groupName = service.group || 'Other Services';
    const subGroupName = service.sub_group || 'General';

    if (!groups[groupName]) {
      groups[groupName] = {};
      groupMinOrder[groupName] = Infinity;
      subGroupMinOrder[groupName] = {};
    }
    if (!groups[groupName][subGroupName]) {
      groups[groupName][subGroupName] = [];
      subGroupMinOrder[groupName][subGroupName] = Infinity;
    }

    groups[groupName][subGroupName].push(service);

    // Track min order for sorting
    const order = service.order || 999;
    groupMinOrder[groupName] = Math.min(groupMinOrder[groupName], order);
    subGroupMinOrder[groupName][subGroupName] = Math.min(subGroupMinOrder[groupName][subGroupName], order);
  });

  // 2. Sort and Flatten
  return Object.keys(groups)
    .sort((a, b) => {
      // Hardcoded overrides for specific groups if needed, otherwise use min order
      if (a === 'Server Status') return -1;
      if (b === 'Server Status') return 1;
      if (a === 'Apps') return -1;
      if (b === 'Apps') return 1;

      // Sort by min order of services in the group
      if (groupMinOrder[a] !== groupMinOrder[b]) {
        return groupMinOrder[a] - groupMinOrder[b];
      }
      return a.localeCompare(b);
    })
    .map(groupName => {
      const subGroupsObj = groups[groupName];
      const subGroups = Object.keys(subGroupsObj)
        .sort((a, b) => {
          // Sort sub-groups by min order of services in them
          if (subGroupMinOrder[groupName][a] !== subGroupMinOrder[groupName][b]) {
            return subGroupMinOrder[groupName][a] - subGroupMinOrder[groupName][b];
          }
          return a.localeCompare(b);
        })
        .map(subGroupName => {
          return {
            name: subGroupName,
            services: subGroupsObj[subGroupName].sort((a, b) => {
              // Sort services by order
              const orderA = a.order || 999;
              const orderB = b.order || 999;
              if (orderA !== orderB) return orderA - orderB;
              return a.service_name.localeCompare(b.service_name);
            })
          };
        });

      return {
        name: groupName,
        subGroups
      };
    });
}
