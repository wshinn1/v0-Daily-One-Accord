import { Inngest } from "inngest"

export const inngest = new Inngest({
  id: "daily-one-accord",
  name: "Daily One Accord",
  eventKey: process.env.INNGEST_EVENT_KEY,
})
