import { defineEventHandler } from "h3";
import cmsData from "../../src/data/cms-data.json";

export default defineEventHandler(async (event) => {
  // Prevent aggressive CDN caching of CMS API response
  event.node.res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  event.node.res.setHeader("Pragma", "no-cache");
  event.node.res.setHeader("Expires", "0");

  return {
    success: true,
    data: cmsData,
  };
});
