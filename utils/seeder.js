require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Barber = require("../models/Barber");
const Customer = require("../models/Customer");
const Service = require("../models/Service");
const Appointment = require("../models/Appointment");
const Attendance = require("../models/Attendance");
const Wage = require("../models/Wage");
const SlotException = require("../models/SlotException");
const TokenBlacklist = require("../models/TokenBlacklist");

const seedDatabase = async () => {
    try {
        console.log("Connecting to Database for seeding...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        // Clear existing collections
        console.log("Clearing existing records...");
        await Promise.all([
            User.deleteMany({}),
            Barber.deleteMany({}),
            Customer.deleteMany({}),
            Service.deleteMany({}),
            Appointment.deleteMany({}),
            Attendance.deleteMany({}),
            Wage.deleteMany({}),
            SlotException.deleteMany({}),
            TokenBlacklist.deleteMany({})
        ]);
        console.log("Database cleared.");

        // 1. Create Users
        console.log("Creating Users (Admin, Receptionist, Barbers)...");
        const adminPass = await bcrypt.hash("admin123", 10);
        const receptionPass = await bcrypt.hash("reception123", 10);
        const barberPass = await bcrypt.hash("barber123", 10);

        const adminUser = await User.create({
            name: "Nikhil Rakhasiya (Admin)",
            email: "admin@salon.com",
            password: adminPass,
            role: "Administrator",
            status: "Active"
        });

        const receptionistUser = await User.create({
            name: "Reception Desk",
            email: "reception@salon.com",
            password: receptionPass,
            role: "Receptionist",
            status: "Active"
        });

        const barberUser1 = await User.create({
            name: "John Stylist",
            email: "john@salon.com",
            password: barberPass,
            role: "Barber",
            status: "Active"
        });

        const barberUser2 = await User.create({
            name: "Alex Colorist",
            email: "alex@salon.com",
            password: barberPass,
            role: "Barber",
            status: "Active"
        });

        // 2. Create Barbers Profiles
        console.log("Creating Barber Profiles...");
        const barber1 = await Barber.create({
            user_id: barberUser1._id,
            specialization: "Master Hair Stylist & Beard Designer",
            commission_percentage: 40.00,
            joining_date: new Date("2026-01-15"),
            shift_start: "09:00",
            shift_end: "19:00",
            status: "Active"
        });

        const barber2 = await Barber.create({
            user_id: barberUser2._id,
            specialization: "Colorist & Head Therapy Specialist",
            commission_percentage: 45.00,
            joining_date: new Date("2026-02-01"),
            shift_start: "10:00",
            shift_end: "20:00",
            status: "Active"
        });

        // 3. Create Services Catalog (Mandated in SRS Section 5.3)
        console.log("Creating Services Catalog...");
        const serviceHaircut = await Service.create({
            service_name: "Haircut",
            duration: 30,
            price: 300.00,
            description: "Precision Hair Cut & Style"
        });

        const serviceBeard = await Service.create({
            service_name: "Beard Styling",
            duration: 20,
            price: 150.00,
            description: "Beard Trim, Line-up & Hot Towel"
        });

        const serviceColoring = await Service.create({
            service_name: "Hair Coloring",
            duration: 60,
            price: 800.00,
            description: "Full Hair Color & Gloss Treatment"
        });

        const serviceFacial = await Service.create({
            service_name: "Facial",
            duration: 45,
            price: 600.00,
            description: "Deep Cleansing Organic Facial"
        });

        const serviceMassage = await Service.create({
            service_name: "Head Massage",
            duration: 30,
            price: 350.00,
            description: "Stress Relief Herbal Head Massage"
        });

        // 4. Create Customers
        console.log("Creating Customers...");
        const cust1 = await Customer.create({
            name: "Rahul Sharma",
            phone: "+91 9876543210",
            email: "rahul.sharma@example.com",
            gender: "Male"
        });

        const cust2 = await Customer.create({
            name: "Priya Patel",
            phone: "+91 9876543211",
            email: "priya.patel@example.com",
            gender: "Female"
        });

        const cust3 = await Customer.create({
            name: "Amit Verma",
            phone: "+91 9876543212",
            email: "amit.verma@example.com",
            gender: "Male"
        });

        const cust4 = await Customer.create({
            name: "Sneha Shah",
            phone: "+91 9876543213",
            email: "sneha.shah@example.com",
            gender: "Female"
        });

        // 5. Create Calendar Exceptions (Holiday)
        console.log("Creating Slot Exceptions & Holidays...");
        await SlotException.create({
            title: "National Holiday - Independence Day",
            type: "Holiday",
            barber_id: null,
            start_time: new Date("2026-08-15T00:00:00.000Z"),
            end_time: new Date("2026-08-15T23:59:59.000Z"),
            remarks: "All branches closed"
        });

        // 6. Create Historical Completed Appointments
        console.log("Creating Sample Appointments...");
        const d1 = new Date();
        d1.setDate(d1.getDate() - 2);
        d1.setHours(10, 0, 0, 0);

        const d2 = new Date();
        d2.setDate(d2.getDate() - 2);
        d2.setHours(11, 0, 0, 0);

        const d3 = new Date();
        d3.setDate(d3.getDate() - 1);
        d3.setHours(14, 0, 0, 0);

        const today1 = new Date();
        today1.setHours(11, 0, 0, 0);

        const today2 = new Date();
        today2.setHours(15, 0, 0, 0);

        await Appointment.create([
            {
                customer_id: cust1._id,
                barber_id: barber1._id,
                service_id: serviceHaircut._id,
                appointment_date: d1,
                end_time: new Date(d1.getTime() + 30 * 60000),
                status: "Completed",
                remarks: "Regular haircut completed"
            },
            {
                customer_id: cust2._id,
                barber_id: barber2._id,
                service_id: serviceColoring._id,
                appointment_date: d2,
                end_time: new Date(d2.getTime() + 60 * 60000),
                status: "Completed",
                remarks: "Full coloring done"
            },
            {
                customer_id: cust1._id,
                barber_id: barber1._id,
                service_id: serviceBeard._id,
                appointment_date: d3,
                end_time: new Date(d3.getTime() + 20 * 60000),
                status: "Completed",
                remarks: "Beard styling completed"
            },
            {
                customer_id: cust3._id,
                barber_id: barber1._id,
                service_id: serviceHaircut._id,
                appointment_date: today1,
                end_time: new Date(today1.getTime() + 30 * 60000),
                status: "Confirmed",
                remarks: "Upcoming booking"
            },
            {
                customer_id: cust4._id,
                barber_id: barber2._id,
                service_id: serviceFacial._id,
                appointment_date: today2,
                end_time: new Date(today2.getTime() + 45 * 60000),
                status: "Pending",
                remarks: "First time facial"
            }
        ]);

        // 7. Create Attendance Records
        console.log("Creating Sample Attendance Logs...");
        const pad = (n) => String(n).padStart(2, '0');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yDateStr = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

        const yCheckIn = new Date(yesterday);
        yCheckIn.setHours(9, 0, 0, 0);
        const yCheckOut = new Date(yesterday);
        yCheckOut.setHours(17, 30, 0, 0);

        await Attendance.create({
            barber_id: barber1._id,
            check_in: yCheckIn,
            check_out: yCheckOut,
            date: yDateStr,
            total_hours: 8.5,
            status: "Checked Out"
        });

        // 8. Create Wage Records
        console.log("Creating Sample Wage Records...");
        const currentMonth = `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}`;
        await Wage.create({
            barber_id: barber1._id,
            month: currentMonth,
            salary: 15000.00,
            commission: 180.00, // 40% of (300 + 150)
            total_amount: 15180.00,
            completed_appointments_count: 2,
            payment_status: "Pending"
        });

        console.log("\n========================================================");
        console.log(" Database Seeding Completed Successfully!");
        console.log("========================================================");
        console.log(" Available Logins for Testing:");
        console.log("  • Administrator : admin@salon.com     / admin123");
        console.log("  • Receptionist  : reception@salon.com / reception123");
        console.log("  • Barber 1      : john@salon.com      / barber123");
        console.log("  • Barber 2      : alex@salon.com      / barber123");
        console.log("========================================================\n");

        process.exit(0);
    } catch (error) {
        console.error("Seeding Failed:", error);
        process.exit(1);
    }
};

seedDatabase();
