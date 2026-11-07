import axios from "axios";

export const errorHandler = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error") || error.code === "ECONNREFUSED") {
      return "Unable to connect to server. Please ensure the backend server is running.";
    }
  }

  return error?.message || "Internal Server Error";
};
