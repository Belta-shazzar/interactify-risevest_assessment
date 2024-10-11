import { ApiResponse } from "@/interfaces/api-response.interface";
import { Request, Response, NextFunction } from "express";

export const transformResponse = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Store the original send method
  const originalSend = res.send.bind(res);

  // Override the res.send method
  res.send = (body: any) => {
    let response: ApiResponse;

    // Determine if the response is an object and not an error message
    if (body && !body.code && typeof body !== "string") {
      response = {
        status: true,
        message: "Request Successful",
        data: body,
      };
    } else if (
      typeof body === "string" &&
      !res.statusCode.toString().startsWith("2")
    ) {
      response = {
        status: false,
        message: body,
        data: null, // You can customize this as needed
      };
    } else {
      // If the body is neither of the above, use it as is
      response = body;
    }

    // Call the original send method with the transformed response
    return originalSend(response);
  };

  next();
};
