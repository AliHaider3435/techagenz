import type { VercelRequest, VercelResponse } from "@vercel/node";
import cmsData from "../src/data/cms-data.json";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  return res.status(200).json({
    success: true,
    data: cmsData,
  });
}
