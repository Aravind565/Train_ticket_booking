const getSeatAvailability = async (req, res) => {
  try {
    const { trainNumber, dates } = req.body;

    // Validate dates are in correct format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dates.every(date => dateRegex.test(date))) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Find seat maps for requested dates
    const seatMaps = await SeatMap.find({
      trainNumber: trainNumber,
      date: { $in: dates }
    });

    // Initialize response structure
    const response = {
      success: true,
      trainNumber,
      availability: {}
    };

    // Process each requested date
    dates.forEach(date => {
      response.availability[date] = {};
      
      // Find seat map for this date
      const seatMap = seatMaps.find(sm => sm.date === date);
      if (!seatMap) {
        // No data for this date
        return;
      }

      // Calculate availability per class
      seatMap.coaches.forEach(coach => {
        const availableSeats = coach.seats.filter(s => !s.isBooked).length;
        response.availability[date][coach.classType] = 
          (response.availability[date][coach.classType] || 0) + availableSeats;
      });
    });

    res.json(response);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};