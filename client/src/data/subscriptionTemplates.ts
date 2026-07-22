export interface SubscriptionTemplate {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  category: string;
  iconSlug: string;
  localIcon?: string;
}

export const subscriptionTemplates: SubscriptionTemplate[] = [
  { id: "netflix", name: "Netflix", price: 43, currency: "PLN", billingCycle: "monthly", category: "Streaming", iconSlug: "siNetflix" },
  { id: "spotify", name: "Spotify Premium", price: 23.99, currency: "PLN", billingCycle: "monthly", category: "Muzyka", iconSlug: "siSpotify" },
  { id: "disney", name: "Disney+", price: 29.99, currency: "PLN", billingCycle: "monthly", category: "Streaming", iconSlug: "siDisneyplus", localIcon: "siDisneyplus.png" },
  { id: "hbomax", name: "HBO Max", price: 29.99, currency: "PLN", billingCycle: "monthly", category: "Streaming", iconSlug: "siHbo" },
  { id: "youtube", name: "YouTube Premium", price: 25.99, currency: "PLN", billingCycle: "monthly", category: "Streaming", iconSlug: "siYoutube" },
  { id: "xbox", name: "Xbox Game Pass Ultimate", price: 55, currency: "PLN", billingCycle: "monthly", category: "Gaming", iconSlug: "siXbox", localIcon: "siXbox.png" },
  { id: "psplus", name: "PlayStation Plus", price: 219.99, currency: "PLN", billingCycle: "yearly", category: "Gaming", iconSlug: "siPlaystation" },
  { id: "chatgpt", name: "ChatGPT Plus", price: 98, currency: "PLN", billingCycle: "monthly", category: "AI / Narzędzia", iconSlug: "siOpenai", localIcon: "siOpenai.png" },
  { id: "icloud", name: "iCloud+", price: 4.99, currency: "PLN", billingCycle: "monthly", category: "Chmura", iconSlug: "siIcloud" },
  { id: "adobe", name: "Adobe Creative Cloud", price: 249, currency: "PLN", billingCycle: "monthly", category: "Narzędzia", iconSlug: "siAdobecreativecloud", localIcon: "siAdobecreativecloud.png" },
];