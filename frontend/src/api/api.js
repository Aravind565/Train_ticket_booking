import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Replace with your backend API URL
});

// Fetch seat availability for 5 days from the given date
export const fetchSeatAvailability = async (trainNumber, date) => {
  try {
    const response = await api.get(`/seatmaps/availability`, {
      params: { trainNumber, date },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching seat availability:', error);
    throw error;
  }
};

export default api;
