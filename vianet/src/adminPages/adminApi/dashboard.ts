import { Request, Response } from "express";

export const getTotalsales = async (req: Request, res: Response) => {
  try {
    const totalSales = 0;
    res.json({ totalSales });
  } catch (error) {
    res.status(500).json({ error: "Failed to get total sales" });
  }
};
