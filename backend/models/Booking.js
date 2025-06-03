  const mongoose = require('mongoose');

  // Clear any existing model definition to prevent caching issues
  delete mongoose.connection.models.Booking;

  const passengerSchema = new mongoose.Schema({
    name: { 
      type: String, 
      required: [true, 'Passenger name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    age: { 
      type: Number, 
      required: [true, 'Passenger age is required'],
      min: [1, 'Age must be at least 1'],
      max: [120, 'Age cannot exceed 120']
    },
    gender: { 
      type: String, 
      enum: ['M', 'F', 'O'], 
      required: [true, 'Passenger gender is required'] 
    },
    berthPreference: { 
      type: String,
      enum:  ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper', 'None', 'Window'],
      default: null
    },
    allocatedSeat: { type: String },
    coachNumber: { type: String },
    seatNumber: { type: String },
    seatPreference: { type: String },
    idType: { type: String },
    idNumber: { type: String },
    
    status: {
  type: String,
  enum: ['CONFIRMED', 'WAITLISTED', 'CANCELLED'], 
  required: [true, 'Passenger status is required']
}, waitlistNumber: { type: Number }

  }, { _id: false });

  const bookingSchema = new mongoose.Schema({
    trainId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Train',
      required: [true, 'Train reference is required']
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    trainNumber: {
      type: String,
      required: true
    },
    trainName: {
      type: String,
      required: true
    },
    from: {
      type: String,
      required: [true, 'Departure station is required'],
      uppercase: true,
      trim: true,
      minlength: [2, 'Station code too short'],
      maxlength: [5, 'Station code too long']
    },
    to: {
      type: String,
      required: [true, 'Arrival station is required'],
      uppercase: true,
      trim: true,
      minlength: [2, 'Station code too short'],
      maxlength: [5, 'Station code too long']
    },
    classType: {
      type: String,
      required: [true, 'Travel class is required'],
      enum: ['SL', '1A', '2A', '3A', 'CC', '2S']
    },
    travelDate: {
      type: Date,
      required: [true, 'Travel date is required'],
      validate: {
        validator: function(date) {
          return date > new Date();
        },
        message: 'Travel date must be in the future'
      }
    },
    passengers: {
      type: [passengerSchema],
      validate: {
        validator: function(p) {
          return p.length > 0 && p.length <= 6;
        },
        message: '1-6 passengers allowed per booking'
      }
    },
    contact: {
      phone: {
        type: String,
        required: [true, 'Contact phone is required'],
      validate: {
  validator: function(v) {
        // Allow optional '+' at start, then 10 to 15 digits
        return /^\+?\d{10,15}$/.test(v);
      },
      message: 'Phone must be 10 to 15 digits, optional leading +'
  }
      },
      email: {
        type: String,
        required: [true, 'Contact email is required'],
        lowercase: true,
        trim: true,
        validate: {
          validator: function(v) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          },
          message: 'Invalid email address'
        }
      }
    },
    preferences: {
      autoUpgrade: { type: Boolean, default: false },
      insurance: { type: Boolean, default: false }
    },
    totalFare: {
      type: Number,
      required: [true, 'Total fare is required'],
      min: [1, 'Fare must be positive']
    },
     status: {
    type: String,
    enum: ['CONFIRMED', 'PARTIALLY_CONFIRMED', 'CANCELLED', 'PENDING'],
    default: 'CONFIRMED'
  },
    bookedAt: {
      type: Date,
      default: Date.now
    },
    pnr: {
      type: String,
      required: true,
      unique: true,  // Keep uniqueness constraint
      uppercase: true,
      trim: true,
      minlength: 8,
      maxlength: 20
      // Removed index: true to prevent duplicate index
    },
    paymentId: {
    type: String,
    required: function() {
      return this.status === 'CONFIRMED' || this.status === 'PARTIALLY_CONFIRMED';
    }
  },
  orderId: {
    type: String,
    required: function() {
      return this.status === 'CONFIRMED' || this.status === 'PARTIALLY_CONFIRMED';
    }
  },
  paymentStatus: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    required: function() {
      return ['CONFIRMED', 'PENDING', 'PARTIALLY_CONFIRMED'].includes(this.status);
    }
  }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

  // Auto-generate PNR if not provided
  bookingSchema.pre('save', async function(next) {
    if (!this.pnr) {
      try {
        let pnr;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
          pnr = `PNR${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 2).toUpperCase()}`;
          const exists = await mongoose.model('Booking').findOne({ pnr });
          if (!exists) {
            this.pnr = pnr;
            break;
          }
          attempts++;
        }
        
        if (!this.pnr) {
          throw new Error('Failed to generate unique PNR');
        }
      } catch (err) {
        next(err);
      }
    }
    next();
  });

  // SINGLE index definition for pnr (with unique constraint)


  // Other indexes
  bookingSchema.index({ userId: 1 });
  bookingSchema.index({ trainId: 1 });
  bookingSchema.index({ 'passengers.name': 'text' });

  // Additional recommended indexes for common queries
  bookingSchema.index({ userId: 1, status: 1 });
  bookingSchema.index({ trainId: 1, travelDate: 1 });
  bookingSchema.index({ status: 1, travelDate: 1 });

  // Singleton pattern to prevent model recompilation
  module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);