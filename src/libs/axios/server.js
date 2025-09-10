import axios from "axios";

// Create an Axios instance
const backendServer = axios.create({
  // baseURL: "https://hotel-booking-cf0a.onrender.com/api/",
  // baseURL: "http://localhost:4000/api/",
  // baseURL: "https://astro-server-rose.vercel.app/api/",
  baseURL: "http://localhost:5000/api/",
  headers: {
    'Content-Type': 'application/json'
  },
});

// Example of a GET request
export const getData = async (endpoint, params, headers) => {
  try {
    const response = await backendServer.get(endpoint, { params, headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Example of a POST request
export const postData = async (endpoint, data, headers) => {
  try {
    const response = await backendServer.post(endpoint, data, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};

// Example of a PUT request
export const putData = async (endpoint, data, headers) => {
  try {
    const response = await backendServer.put(endpoint, data, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};

// Example of a PATCH request
export const patchData = async (endpoint, data, headers) => {
  try {
    const response = await backendServer.patch(endpoint, data, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
};

// Example of a PATCH request
export const deleteData = async (endpoint, params, headers) => {
  try {
    const response = await backendServer.delete(endpoint, { params, headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export default backendServer;
