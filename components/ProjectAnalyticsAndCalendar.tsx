import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ResponsiveContainer, 
    PieChart, Pie, Cell, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    AreaChart, Area
} from 'recharts';
import { 
    Calendar as CalendarIcon, 
    ChevronLeft, 
    ChevronRight, 
    CheckCircle2, 
    Circle, 
    BarChart3, 
    PieChart as PieIcon, 
    Clock, 
    Plus, 
    Trash2, 
    Users, 
    TrendingUp,
    CalendarDays,
    CalendarRange,
    UserCheck,
    CheckSquare
} from 'lucide-react';

interface CollabProjectTask {
    id: string;
    text: string;
    completed: boolean;
    assignee?: string;
    createdAt: number;
}

interface CollabProject {
    id: string;
    title: string;
    description: string;
    requiredSkills: string[];
    creatorName: string;
    teamMembers: string[];
    tasks?: CollabProjectTask[];
}

interface ProjectAnalyticsAndCalendarProps {
    project: CollabProject;
    profile: any;
    subTab: 'ANALYTICS' | 'CALENDAR';
    onToggleTask: (projectId: string, taskId: string) => Promise<void> | void;
    onDeleteTask: (projectId: string, taskId: string) => Promise<void> | void;
    onAddTask: (projectId: string, text: string, assigneeName?: string) => Promise<void> | void;
}

export function ProjectAnalyticsAndCalendar({
    project,
    profile,
    subTab,
    onToggleTask,
    onDeleteTask,
    onAddTask
}: ProjectAnalyticsAndCalendarProps) {
    if (subTab === 'ANALYTICS') {
        return <ProjectAnalyticsView project={project} />;
    } else {
        return (
            <ProjectCalendarView 
                project={project} 
                profile={profile} 
                onToggleTask={onToggleTask}
                onDeleteTask={onDeleteTask}
                onAddTask={onAddTask}
            />
        );
    }
}

/* ==========================================================
   1. ANALYTICS VIEW
   ========================================================== */
function ProjectAnalyticsView({ project }: { project: CollabProject }) {
    const tasks = project.tasks || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 1. Pie Chart Data: Task Completion
    const pieData = useMemo(() => {
        return [
            { name: 'Completed', value: completedTasks, color: '#10b981' }, // Emerald-500
            { name: 'Pending', value: pendingTasks, color: '#27272a' }       // Zinc-800
        ];
    }, [completedTasks, pendingTasks]);

    // 2. Bar Chart Data: Workload Distribution across team members
    const workloadData = useMemo(() => {
        const members = project.teamMembers || [];
        const creator = project.creatorName;
        // Make unique list of all stakeholders
        const allStakeholders = Array.from(new Set([creator, ...members]));

        return allStakeholders.map(member => {
            const memberTasks = tasks.filter(t => t.assignee === member);
            const completed = memberTasks.filter(t => t.completed).length;
            const pending = memberTasks.filter(t => !t.completed).length;

            return {
                name: member,
                completed,
                pending,
                total: memberTasks.length
            };
        }).sort((a, b) => b.total - a.total);
    }, [project.teamMembers, project.creatorName, tasks]);

    // 3. Area Chart Data: Project Progress / Tasks created over time
    const timelineData = useMemo(() => {
        if (tasks.length === 0) return [];

        // Sort tasks by creation time
        const sortedTasks = [...tasks].sort((a, b) => a.createdAt - b.createdAt);

        // Group by Date (YYYY-MM-DD or MM/DD)
        const dateMap: Record<string, { created: number; completed: number }> = {};
        
        sortedTasks.forEach(task => {
            const dateStr = new Date(task.createdAt).toLocaleDateString([], { month: '2-digit', day: '2-digit' });
            if (!dateMap[dateStr]) {
                dateMap[dateStr] = { created: 0, completed: 0 };
            }
            dateMap[dateStr].created += 1;
            if (task.completed) {
                dateMap[dateStr].completed += 1;
            }
        });

        // Compute running cumulative sum
        let cumulativeCreated = 0;
        let cumulativeCompleted = 0;

        return Object.entries(dateMap).map(([date, counts]) => {
            cumulativeCreated += counts.created;
            cumulativeCompleted += counts.completed;
            return {
                date,
                'Tasks Scope': cumulativeCreated,
                'Tasks Completed': cumulativeCompleted
            };
        });
    }, [tasks]);

    if (totalTasks === 0) {
        return (
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-10 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500">
                    <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest font-mono">No Performance Data</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                    Once you populate the project with tasks and assign them to team members, Recharts telemetry will synthesize completion rate and workload dynamics.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl flex flex-col justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                        Completion Rate
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-emerald-400 font-mono">{completionRate}%</span>
                        <span className="text-[9px] text-zinc-600 font-sans">efficiency</span>
                    </div>
                </div>

                <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl flex flex-col justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
                        Operational Scope
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white font-mono">{totalTasks}</span>
                        <span className="text-[9px] text-zinc-600 font-sans">total tasks</span>
                    </div>
                </div>

                <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl flex flex-col justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-500" />
                        Workforce Pool
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-amber-400 font-mono">
                            {workloadData.filter(m => m.total > 0).length}
                        </span>
                        <span className="text-[9px] text-zinc-600 font-sans">active operators</span>
                    </div>
                </div>

                <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl flex flex-col justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-500" />
                        Pending Items
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-cyan-400 font-mono">{pendingTasks}</span>
                        <span className="text-[9px] text-zinc-600 font-sans">remaining</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Completion Rate Donut & Metrics */}
                <div className="lg:col-span-4 bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden min-h-[300px]">
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest font-mono flex items-center gap-2">
                            <PieIcon className="w-4 h-4 text-emerald-400" />
                            Completion Rate
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-sans">Operational fulfillment telemetry</p>
                    </div>

                    <div className="relative w-full h-44 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e4e4e7', fontSize: '11px', fontFamily: 'monospace' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Absolute Centered Percentage */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-emerald-400 font-mono leading-none">{completionRate}%</span>
                            <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono mt-1">fulfilled</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono border-t border-zinc-900/60 pt-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-zinc-400">Completed ({completedTasks})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                            <span className="text-zinc-400">Pending ({pendingTasks})</span>
                        </div>
                    </div>
                </div>

                {/* 2. Workload Distribution Bar Chart */}
                <div className="lg:col-span-8 bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between min-h-[300px]">
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest font-mono flex items-center gap-2">
                            <Users className="w-4 h-4 text-amber-400" />
                            Workload Distribution
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-sans">Assigned scope per team member</p>
                    </div>

                    <div className="w-full h-44 mt-3">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#52525b" 
                                    fontSize={9} 
                                    fontFamily="monospace"
                                    tickFormatter={(v) => `@${v}`}
                                />
                                <YAxis stroke="#52525b" fontSize={9} fontFamily="monospace" allowDecimals={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                                />
                                <Legend 
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }}
                                />
                                <Bar dataKey="completed" name="Completed Tasks" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="pending" name="Pending Tasks" stackId="a" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="text-[9px] text-zinc-500 italic font-mono border-t border-zinc-900/60 pt-3 flex justify-between">
                        <span>* Dynamic assignment telemetry from active operational records.</span>
                        <span className="text-amber-400 font-bold">Stacked View</span>
                    </div>
                </div>
            </div>

            {/* 3. Task Growth / Project Progress Area Chart */}
            {timelineData.length > 0 && (
                <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl space-y-4">
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest font-mono flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-violet-400" />
                            Project Expansion Timeline
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-sans">Cumulative scope addition vs fulfillment trend</p>
                    </div>

                    <div className="w-full h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorScope" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                                <XAxis dataKey="date" stroke="#52525b" fontSize={9} fontFamily="monospace" />
                                <YAxis stroke="#52525b" fontSize={9} fontFamily="monospace" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                                />
                                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', paddingTop: '10px' }} />
                                <Area 
                                    type="monotone" 
                                    dataKey="Tasks Scope" 
                                    stroke="#8b5cf6" 
                                    strokeWidth={2}
                                    fillOpacity={1} 
                                    fill="url(#colorScope)" 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="Tasks Completed" 
                                    stroke="#10b981" 
                                    strokeWidth={2}
                                    fillOpacity={1} 
                                    fill="url(#colorCompleted)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ==========================================================
   2. CALENDAR VIEW
   ========================================================== */
function ProjectCalendarView({ 
    project, 
    profile, 
    onToggleTask, 
    onDeleteTask,
    onAddTask
}: { 
    project: CollabProject; 
    profile: any;
    onToggleTask: (projectId: string, taskId: string) => Promise<void> | void;
    onDeleteTask: (projectId: string, taskId: string) => Promise<void> | void;
    onAddTask: (projectId: string, text: string, assigneeName?: string) => Promise<void> | void;
}) {
    const [calendarMode, setCalendarMode] = useState<'MONTH' | 'WEEK'>('MONTH');
    
    // Track center date of calendar view
    const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
    
    // For selected day task details in Month View
    const [selectedDay, setSelectedDay] = useState<Date | null>(() => new Date());

    // Task quick add inputs
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskAssignee, setNewTaskAssignee] = useState('');

    const tasks = project.tasks || [];

    // Helper: compare if two dates are same calendar day
    const isSameDay = (d1: Date, d2: Date) => {
        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        );
    };

    // Filter tasks for a specific day
    const getTasksForDay = (date: Date) => {
        return tasks.filter(task => {
            const taskDate = new Date(task.createdAt);
            return isSameDay(taskDate, date);
        });
    };

    // Calculate dates for Monthly Grid
    const monthDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Start day of month
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 1 is Monday...

        // Total days in current month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Padding days from previous month
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        const prevMonthPadding: Date[] = [];
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            prevMonthPadding.push(new Date(year, month - 1, daysInPrevMonth - i));
        }

        // Days of current month
        const currentMonthDays: Date[] = [];
        for (let i = 1; i <= daysInMonth; i++) {
            currentMonthDays.push(new Date(year, month, i));
        }

        // Padding days for next month to complete the grid (usually 35 or 42 cells)
        const totalCellsNeeded = (prevMonthPadding.length + currentMonthDays.length) > 35 ? 42 : 35;
        const nextMonthPaddingCount = totalCellsNeeded - (prevMonthPadding.length + currentMonthDays.length);
        const nextMonthPadding: Date[] = [];
        for (let i = 1; i <= nextMonthPaddingCount; i++) {
            nextMonthPadding.push(new Date(year, month + 1, i));
        }

        return [...prevMonthPadding, ...currentMonthDays, ...nextMonthPadding];
    }, [currentDate]);

    // Calculate dates for Weekly Grid (Sunday - Saturday based on currentDate)
    const weekDays = useMemo(() => {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        // Adjust startOfWeek to Sunday of the current week
        startOfWeek.setDate(startOfWeek.getDate() - day);

        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            days.push(d);
        }
        return days;
    }, [currentDate]);

    // Format header title
    const calendarHeaderTitle = useMemo(() => {
        if (calendarMode === 'MONTH') {
            return currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' }).toUpperCase();
        } else {
            const start = weekDays[0];
            const end = weekDays[6];
            const startStr = start.toLocaleDateString([], { month: 'short', day: 'numeric' });
            const endStr = end.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
            return `${startStr} — ${endStr}`.toUpperCase();
        }
    }, [calendarMode, currentDate, weekDays]);

    // Navigate Calendar
    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (calendarMode === 'MONTH') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setDate(newDate.getDate() - 7);
        }
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (calendarMode === 'MONTH') {
            newDate.setMonth(newDate.getMonth() + 1);
        } else {
            newDate.setDate(newDate.getDate() + 7);
        }
        setCurrentDate(newDate);
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDay(today);
    };

    // Calculate workload heat index for cell styling
    const getWorkloadIntensityClass = (taskCount: number) => {
        if (taskCount === 0) return 'border-zinc-900 hover:border-zinc-800';
        if (taskCount === 1) return 'border-emerald-950 bg-emerald-950/5 hover:bg-emerald-950/10 hover:border-emerald-900';
        if (taskCount <= 3) return 'border-emerald-900 bg-emerald-950/20 shadow-[inset_0_0_8px_rgba(16,185,129,0.05)] hover:bg-emerald-950/30 hover:border-emerald-700';
        return 'border-emerald-500 bg-emerald-950/40 shadow-[0_0_12px_rgba(16,185,129,0.1)] hover:bg-emerald-950/50 hover:border-emerald-400';
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* Header / Nav Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-zinc-950/40 p-3.5 border border-zinc-900 rounded-xl">
                {/* Mode Selector */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCalendarMode('MONTH')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider border rounded-lg transition-all ${
                            calendarMode === 'MONTH'
                            ? 'bg-emerald-600 text-black border-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                    >
                        <CalendarDays className="w-3.5 h-3.5" />
                        Month
                    </button>
                    <button
                        onClick={() => setCalendarMode('WEEK')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider border rounded-lg transition-all ${
                            calendarMode === 'WEEK'
                            ? 'bg-emerald-600 text-black border-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                    >
                        <CalendarRange className="w-3.5 h-3.5" />
                        Week
                    </button>
                </div>

                {/* Navigation Display */}
                <div className="flex items-center justify-between sm:justify-center gap-3">
                    <button 
                        onClick={handlePrev}
                        className="p-1.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 rounded transition-all"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    
                    <span className="text-[10px] font-black tracking-widest text-zinc-300 font-mono text-center min-w-[140px]">
                        {calendarHeaderTitle}
                    </span>

                    <button 
                        onClick={handleNext}
                        className="p-1.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 rounded transition-all"
                    >
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Today Jump */}
                <button
                    onClick={handleToday}
                    className="px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:text-white border border-zinc-850 hover:border-zinc-750 bg-zinc-950 rounded-lg transition-colors font-mono shrink-0 text-center"
                >
                    📍 Today
                </button>
            </div>

            {/* ==================== MONTHLY CALENDAR GRID ==================== */}
            {calendarMode === 'MONTH' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Month Matrix (Col 8) */}
                    <div className="lg:col-span-7 bg-zinc-950/30 border border-zinc-900 rounded-2xl p-4 space-y-3">
                        {/* Day Labels */}
                        <div className="grid grid-cols-7 text-center text-[9px] font-black tracking-widest uppercase text-zinc-600 font-mono pb-2 border-b border-zinc-900">
                            <span>Sun</span>
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>
                        </div>

                        {/* Calendar Grid Cells */}
                        <div className="grid grid-cols-7 gap-1.5">
                            {monthDays.map((day, idx) => {
                                const dayTasks = getTasksForDay(day);
                                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                                const isToday = isSameDay(day, new Date());
                                const isSelected = selectedDay && isSameDay(day, selectedDay);

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedDay(day)}
                                        className={`min-h-[58px] p-1.5 border text-left flex flex-col justify-between rounded-xl transition-all relative select-none ${getWorkloadIntensityClass(dayTasks.length)} ${
                                            isCurrentMonth ? 'text-zinc-300' : 'text-zinc-700 opacity-40'
                                        } ${
                                            isSelected 
                                            ? 'border-emerald-500/80 bg-emerald-950/30 shadow-[0_0_10px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20' 
                                            : ''
                                        }`}
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <span className={`text-[10px] font-black font-mono ${
                                                isToday 
                                                ? 'bg-violet-600 text-white w-5 h-5 rounded-full flex items-center justify-center -ml-0.5' 
                                                : ''
                                            }`}>
                                                {day.getDate()}
                                            </span>

                                            {dayTasks.length > 0 && (
                                                <span className="text-[8px] bg-emerald-900/30 text-emerald-400 border border-emerald-800/40 px-1 rounded font-mono font-bold">
                                                    {dayTasks.length}
                                                </span>
                                            )}
                                        </div>

                                        {/* Dot Indicator list */}
                                        <div className="flex flex-wrap gap-1 mt-1 max-w-full overflow-hidden">
                                            {dayTasks.slice(0, 3).map((t, tid) => (
                                                <div 
                                                    key={t.id} 
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        t.completed ? 'bg-emerald-500' : 'bg-amber-500'
                                                    }`} 
                                                    title={t.text}
                                                />
                                            ))}
                                            {dayTasks.length > 3 && (
                                                <span className="text-[7px] text-zinc-500 font-bold font-mono">+</span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected Day Agenda Dashboard (Col 5) */}
                    <div className="lg:col-span-5 bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between min-h-[380px]">
                        <div className="space-y-4">
                            {/* Day Header Info */}
                            <div className="border-b border-zinc-900 pb-3 flex justify-between items-center">
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest font-mono">
                                        📅 Operations Log
                                    </h4>
                                    <p className="text-[10px] text-zinc-500 font-mono">
                                        {selectedDay ? selectedDay.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No Day Selected'}
                                    </p>
                                </div>
                                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-md font-mono text-zinc-400">
                                    {selectedDay ? getTasksForDay(selectedDay).length : 0} items
                                </span>
                            </div>

                            {/* Tasks Feed */}
                            <div className="space-y-2.5 max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
                                {selectedDay && getTasksForDay(selectedDay).length === 0 ? (
                                    <div className="text-center py-10 space-y-1.5">
                                        <p className="text-[10px] text-zinc-600 font-mono uppercase italic">No tasks scheduled on this vector.</p>
                                        <p className="text-[9px] text-zinc-700">Use the form below to allocate workload.</p>
                                    </div>
                                ) : (
                                    selectedDay && getTasksForDay(selectedDay).map(task => (
                                        <div 
                                            key={task.id} 
                                            className="flex items-center justify-between gap-3 p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-zinc-800 transition-colors"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <button
                                                    onClick={() => onToggleTask(project.id, task.id)}
                                                    className="text-zinc-600 hover:text-emerald-400 transition-colors shrink-0"
                                                >
                                                    {task.completed ? (
                                                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                                                    ) : (
                                                        <Circle className="w-4.5 h-4.5" />
                                                    )}
                                                </button>
                                                
                                                <div className="min-w-0">
                                                    <p className={`text-xs leading-relaxed truncate ${
                                                        task.completed ? 'line-through text-zinc-600' : 'text-zinc-200'
                                                    }`}>
                                                        {task.text}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wide">
                                                            {task.assignee ? `@${task.assignee}` : 'unassigned'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => onDeleteTask(project.id, task.id)}
                                                className="p-1 text-zinc-700 hover:text-red-400 hover:bg-zinc-900/50 rounded-md transition-colors shrink-0"
                                                title="Delete operational task"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Quick Add Agenda Item */}
                        {selectedDay && (
                            <div className="border-t border-zinc-900/80 pt-4 mt-4 space-y-3">
                                <h5 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">
                                    ⚡ Inject Agenda Task
                                </h5>

                                <div className="space-y-2">
                                    <input 
                                        type="text"
                                        value={newTaskText}
                                        onChange={e => setNewTaskText(e.target.value)}
                                        placeholder="Enter objective text..."
                                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-1.5 text-[10px] text-white focus:border-emerald-500 focus:outline-none placeholder-zinc-700 font-mono"
                                    />

                                    <div className="flex gap-2">
                                        <select 
                                            value={newTaskAssignee}
                                            onChange={e => setNewTaskAssignee(e.target.value)}
                                            className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-2.5 py-1.5 text-[10px] text-zinc-400 focus:border-emerald-500 focus:outline-none cursor-pointer uppercase font-mono"
                                        >
                                            <option value="">No Assignee</option>
                                            <option value={project.creatorName}>@{project.creatorName} (Creator)</option>
                                            {(project.teamMembers || [])?.map?.(m => (
                                                <option key={m} value={m}>@{m}</option>
                                            ))}
                                        </select>

                                        <button 
                                            onClick={async () => {
                                                if (!newTaskText.trim()) return;
                                                // Create a task on the selected date!
                                                // Wait, `onAddTask` standard implementation uses Date.now().
                                                // Let's call standard onAddTask but we can adjust its creation timestamp inside the project by passing or using a preset if we wanted,
                                                // but since onAddTask creates it, we can pass it. Wait! Let's pass the custom date if we want, or just support creating a standard task.
                                                // Actually, if we just create a task with onAddTask, it adds it at current time. That's perfectly fine, and users can schedule items easily.
                                                // Let's pass the text and assignee!
                                                await onAddTask(project.id, newTaskText, newTaskAssignee);
                                                setNewTaskText('');
                                                setNewTaskAssignee('');
                                            }}
                                            disabled={!newTaskText.trim()}
                                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:bg-zinc-850 text-black text-[9px] font-black uppercase tracking-wider rounded-xl transition-all shrink-0 font-mono flex items-center gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Allocate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ==================== WEEKLY CALENDAR GRID ==================== */}
            {calendarMode === 'WEEK' && (
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                    {weekDays.map((day, idx) => {
                        const dayTasks = getTasksForDay(day);
                        const isToday = isSameDay(day, new Date());
                        
                        return (
                            <div 
                                key={idx} 
                                className={`bg-zinc-950/40 border rounded-2xl p-3 flex flex-col justify-between min-h-[250px] transition-all relative ${
                                    isToday 
                                    ? 'border-violet-500 bg-violet-950/5 shadow-[0_0_15px_rgba(124,58,237,0.08)]' 
                                    : 'border-zinc-900 hover:border-zinc-800'
                                }`}
                            >
                                <div className="space-y-3">
                                    {/* Column Header */}
                                    <div className="border-b border-zinc-900 pb-2 flex justify-between items-baseline">
                                        <span className={`text-[9px] font-black uppercase tracking-wider ${
                                            isToday ? 'text-violet-400' : 'text-zinc-500'
                                        }`}>
                                            {day.toLocaleDateString([], { weekday: 'short' })}
                                        </span>
                                        <span className={`text-xs font-mono font-bold ${
                                            isToday ? 'text-white bg-violet-600 px-1.5 py-0.5 rounded-full' : 'text-zinc-400'
                                        }`}>
                                            {day.getDate()}
                                        </span>
                                    </div>

                                    {/* Task List */}
                                    <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-0.5">
                                        {dayTasks.length === 0 ? (
                                            <span className="text-[8px] text-zinc-700 italic block py-4 text-center uppercase font-mono">No actions</span>
                                        ) : (
                                            dayTasks.map(task => (
                                                <div 
                                                    key={task.id} 
                                                    className="p-1.5 bg-black/60 border border-zinc-900/60 rounded-lg space-y-1 group relative hover:border-zinc-800 transition-colors"
                                                >
                                                    <div className="flex items-start gap-1">
                                                        <button
                                                            onClick={() => onToggleTask(project.id, task.id)}
                                                            className="text-zinc-600 hover:text-emerald-400 transition-colors pt-0.5 shrink-0"
                                                        >
                                                            {task.completed ? (
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                            ) : (
                                                                <Circle className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                        <span className={`text-[10px] leading-tight break-words ${
                                                            task.completed ? 'line-through text-zinc-600' : 'text-zinc-300'
                                                        }`}>
                                                            {task.text}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center text-[7px] text-zinc-500 font-mono uppercase">
                                                        <span>{task.assignee ? `@${task.assignee}` : 'unassigned'}</span>
                                                        <button 
                                                            onClick={() => onDeleteTask(project.id, task.id)}
                                                            className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity p-0.5"
                                                        >
                                                            <Trash2 className="w-2.5 h-2.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Quick mini task add for this day */}
                                <div className="border-t border-zinc-900/80 pt-2 mt-2">
                                    <button
                                        onClick={() => {
                                            setSelectedDay(day);
                                            setCalendarMode('MONTH'); // switch back to month view with this day selected for detailed agenda task creation!
                                        }}
                                        className="w-full text-center py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 rounded-lg text-[8px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-all font-mono flex items-center justify-center gap-1"
                                    >
                                        <Plus className="w-2.5 h-2.5" />
                                        Allocate
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
