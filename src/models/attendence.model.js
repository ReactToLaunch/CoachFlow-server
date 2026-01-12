import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  courseId: {
    type: String, 
    required: true
  },
  records: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT'],
      required: true
    }
  }]
}, { timestamps: true });


const Attendance = mongoose.model('Attendance', attendanceSchema);


export { Attendance };