
const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["approved", "pending"],
        default: "pending",
        required: true
    },
    enrolledOn: {
        type: Date,
        default: Date.now
    }
});

EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
module.exports = mongoose.model("Enrollment", EnrollmentSchema);