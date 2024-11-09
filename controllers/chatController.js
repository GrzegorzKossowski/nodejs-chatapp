import asyncHandler from "express-async-handler";

export const testController = asyncHandler(async (req, res) => {
  return res.json({ message: "hula" });
});