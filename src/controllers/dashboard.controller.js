import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { Batch } from '../models/batch.model.js';
import { Fee } from '../models/fees.model.js';
import { Attendance } from '../models/attendence.model.js';

/**
 * Get Dashboard Analytics Stats
 * Returns aggregated data for dashboard charts and stat cards
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    const totalStudents = await User.countDocuments({ selectedRole: 'student' });
    const totalBatches = await Batch.countDocuments({ isActive: true });

    // Revenue stats
    const fees = await Fee.find({});
    let totalRevenue = 0;
    let pendingFees = 0;
    let lastMonthRevenue = 0;

    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    fees.forEach(fee => {
        totalRevenue += fee.paidAmount;
        pendingFees += fee.pendingAmount;

        // Calculate last month's revenue from transactions
        fee.transactions.forEach(tx => {
            const txDate = new Date(tx.date);
            if (txDate >= firstDayLastMonth && txDate < firstDayCurrentMonth) {
                lastMonthRevenue += tx.amount;
            }
        });
    });

    // Revenue Chart Data (last 6 months)
    const revenueChartData = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

        let monthRevenue = 0;
        fees.forEach(fee => {
            fee.transactions.forEach(tx => {
                const txDate = new Date(tx.date);
                if (txDate >= start && txDate <= end) {
                    monthRevenue += tx.amount;
                }
            });
        });

        revenueChartData.push({
            month: d.toLocaleString('default', { month: 'short' }),
            revenue: monthRevenue
        });
    }

    // Student Growth Data (last 6 months)
    const studentGrowthData = [];
    const students = await User.find({ selectedRole: 'student' });
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

        const count = students.filter(s => new Date(s.createdAt) <= end).length;
        studentGrowthData.push({
            month: d.toLocaleString('default', { month: 'short' }),
            students: count
        });
    }

    // Batch Performance
    const batches = await Batch.find({ isActive: true });
    const batchPerformance = await Promise.all(batches.map(async (batch) => {
        const studentCount = await User.countDocuments({ batch: batch._id, selectedRole: 'student' });
        const batchFees = await Fee.find({ batch: batch._id });
        const collected = batchFees.reduce((sum, f) => sum + f.paidAmount, 0);

        // Average attendance for this batch last 30 days
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const attendanceRecords = await Attendance.find({
            batch: batch._id,
            date: { $gte: last30Days }
        });

        let avgAttendance = 0;
        if (attendanceRecords.length > 0) {
            const totalPossible = attendanceRecords.reduce((sum, r) => sum + r.totalStudents, 0);
            const totalAbsent = attendanceRecords.reduce((sum, r) => sum + r.absentStudents.length, 0);
            avgAttendance = ((totalPossible - totalAbsent) / totalPossible) * 100;
        }

        return {
            name: batch.Name,
            students: studentCount,
            attendance: Math.round(avgAttendance) || 0,
            revenue: collected
        };
    }));

    // Recent Defaulters
    const defaulters = await Fee.find({ status: 'OVERDUE' })
        .populate('student', 'fullName')
        .sort({ nextDueDate: 1 })
        .limit(5);

    const defaulterData = defaulters.map(f => ({
        name: f.student.fullName,
        amount: f.pendingAmount,
        days: Math.ceil((now - new Date(f.nextDueDate)) / (1000 * 60 * 60 * 24)) + " days overdue"
    }));

    // Attendance Trends (last 14 days)
    const attendanceTrends = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(nextD.getDate() + 1);

        const records = await Attendance.find({
            date: { $gte: d, $lt: nextD }
        });

        let totalP = 0;
        let totalS = 0;
        records.forEach(r => {
            totalS += r.totalStudents;
            totalP += (r.totalStudents - r.absentStudents.length);
        });

        attendanceTrends.push({
            date: d.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
            percentage: totalS > 0 ? Math.round((totalP / totalS) * 100) : 0,
            fullDate: d.toISOString()
        });
    }

    // Response
    const stats = {
        totalStudents,
        totalBatches,
        totalRevenue,
        pendingFees,
        revenueComparison: lastMonthRevenue > 0 ? Math.round(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0,
        revenueChartData,
        studentGrowthData,
        batchPerformance,
        defaulters: defaulterData,
        attendanceTrends
    };

    return res.status(200).json(
        new ApiResponse(200, stats, "Dashboard stats fetched successfully")
    );
});

export { getDashboardStats };
