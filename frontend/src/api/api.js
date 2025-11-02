import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // ✅ uses environment variable
});

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

