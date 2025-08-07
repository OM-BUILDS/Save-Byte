import { useCallback } from "react";

export const useHttpClient = () => {
  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      try {
        if (body && typeof body === "object") {
          body = JSON.stringify(body);
          headers["Content-Type"] = "application/json";
        }

        const response = await fetch(url, {
          method,
          body,
          headers,
        });

        let responseData;
        try {
          responseData = await response.json();
        } catch (error) {
          responseData = null;
        }

        if (!response.ok) {
          return {
            error: true,
            status: response.status,
            message: responseData?.message || "Something went wrong!",
          };
        }

        return responseData;
      } catch (err) {
        return {
          error: true,
          message: err.message || "Network error occurred",
        };
      }
    },
    []
  );

  return { sendRequest };
};
