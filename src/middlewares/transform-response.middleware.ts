import { Request, Response, NextFunction } from "express";

export const transformResponse = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalSend = res.send.bind(res);

  res.send = (body: any) => {
    const isSuccessful = res.statusCode.toString().startsWith("2");
    const response =
      typeof body === "object" && !body?.code
        ? { status: true, message: "Request Successful", data: body }
        : {
            status: isSuccessful,
            message: isSuccessful ? "Request Successful" : body,
            data: isSuccessful ? body : null,
          };

    return originalSend(response);
  };

  next();
};
