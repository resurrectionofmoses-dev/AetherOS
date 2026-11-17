import { NetworkProject, ProjectTask } from '../types';

export interface DueDateStatus {
  status: 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'none';
  label: string;
  diffDays: number;
  formattedDate: string;
}

export function parseDateOnly(dateStr?: string): Date | null {
  if (!dateStr) return null;
  // Handle YYYY-MM-DD or ISO strings
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDueDate(dueDateStr?: string, isCompleted: boolean = false): DueDateStatus {
  if (!dueDateStr) {
    return {
      status: 'none',
      label: 'No due date',
      diffDays: 0,
      formattedDate: ''
    };
  }

  const dueDate = parseDateOnly(dueDateStr);
  if (!dueDate) {
    return {
      status: 'none',
      label: dueDateStr,
      diffDays: 0,
      formattedDate: dueDateStr
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: dueDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined };
  const formattedDate = dueDate.toLocaleDateString(undefined, options);

  if (isCompleted) {
    return {
      status: 'upcoming',
      label: `Completed (${formattedDate})`,
      diffDays,
      formattedDate
    };
  }

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return {
      status: 'overdue',
      label: `Overdue by ${daysAgo} day${daysAgo === 1 ? '' : 's'} (${formattedDate})`,
      diffDays,
      formattedDate
    };
  }

  if (diffDays === 0) {
    return {
      status: 'today',
      label: `Due Today (${formattedDate})`,
      diffDays,
      formattedDate
    };
  }

  if (diffDays === 1) {
    return {
      status: 'tomorrow',
      label: `Due Tomorrow (${formattedDate})`,
      diffDays,
      formattedDate
    };
  }

  return {
    status: 'upcoming',
    label: `Due in ${diffDays} days (${formattedDate})`,
    diffDays,
    formattedDate
  };
}

export function getPresetDate(type: 'today' | 'tomorrow' | 'in3days' | 'nextweek' | 'in1month'): string {
  const d = new Date();
  switch (type) {
    case 'today':
      break;
    case 'tomorrow':
      d.setDate(d.getDate() + 1);
      break;
    case 'in3days':
      d.setDate(d.getDate() + 3);
      break;
    case 'nextweek':
      d.setDate(d.getDate() + 7);
      break;
    case 'in1month':
      d.setMonth(d.getMonth() + 1);
      break;
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  progressPercent: number;
  health: 'COMPLETED' | 'AT_RISK' | 'ON_TRACK' | 'NO_TASKS';
}

export function getProjectStats(project: NetworkProject): ProjectStats {
  const tasks = project.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const overdueTasks = tasks.filter(t => {
    if (t.completed || !t.dueDate) return false;
    const info = formatDueDate(t.dueDate, false);
    return info.status === 'overdue';
  }).length;

  const progressPercent = totalTasks === 0 
    ? (project.status === 'DONE' ? 100 : 0)
    : Math.round((completedTasks / totalTasks) * 100);

  let health: ProjectStats['health'] = 'ON_TRACK';
  if (totalTasks === 0) {
    health = project.status === 'DONE' ? 'COMPLETED' : 'NO_TASKS';
  } else if (completedTasks === totalTasks) {
    health = 'COMPLETED';
  } else if (overdueTasks > 0) {
    health = 'AT_RISK';
  } else {
    health = 'ON_TRACK';
  }

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    progressPercent,
    health
  };
}

export interface GlobalProjectSummary {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completedProjects: number;
  activeProjects: number;
  overallProgress: number;
}

export function getGlobalSummary(projects: NetworkProject[]): GlobalProjectSummary {
  let totalTasks = 0;
  let completedTasks = 0;
  let overdueTasks = 0;
  let completedProjects = 0;

  for (const proj of projects) {
    const stats = getProjectStats(proj);
    totalTasks += stats.totalTasks;
    completedTasks += stats.completedTasks;
    overdueTasks += stats.overdueTasks;
    if (stats.health === 'COMPLETED' || proj.status === 'DONE') {
      completedProjects++;
    }
  }

  const pendingTasks = totalTasks - completedTasks;
  const activeProjects = projects.length - completedProjects;
  const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    totalProjects: projects.length,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    completedProjects,
    activeProjects,
    overallProgress
  };
}
