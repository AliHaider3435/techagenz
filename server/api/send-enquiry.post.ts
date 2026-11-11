import { defineEventHandler, setResponseStatus } from "h3";

export default defineEventHandler((event) => {
  setResponseStatus(event, 410);
  return {
    success: false,
    error:
      "This enquiry endpoint has been retired. Submit enquiries through the Cloudflare Worker.",
  };
});
