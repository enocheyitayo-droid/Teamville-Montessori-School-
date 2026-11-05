export const enquiryTopics = ["Admissions", "Arrange a visit", "General enquiry"] as const;
export const enquiryClasses = ["Not sure yet", "Nursery 1", "Nursery 2", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"] as const;
export type EnquiryField = "name" | "email" | "phone" | "topic" | "classInterest" | "message" | "consent";
export type EnquiryErrors = Partial<Record<EnquiryField, string>>;
export type WebsiteEnquiry = { requestId: string; name: string; email: string; phone: string; topic: string; classInterest: string; message: string; consent: true };

export function parseEnquiry(input: unknown): { value: WebsiteEnquiry; errors?: never } | { errors: EnquiryErrors; value?: never } {
  const data = input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const text = (key: string) => typeof data[key] === "string" ? data[key].trim() as string : "";
  const name=text("name"), email=text("email").toLowerCase(), phone=text("phone"), topic=text("topic"), classInterest=text("classInterest"), message=text("message"), requestId=text("requestId");
  const errors: EnquiryErrors = {};
  if (name.length < 2 || name.length > 100 || /[\r\n\x00-\x1f]/.test(name)) errors.name="Enter your name (2–100 characters).";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email="Enter a valid email address.";
  if (phone && (!/^[+\d\s().-]{7,30}$/.test(phone) || phone.replace(/\D/g, "").length < 7)) errors.phone="Enter a valid phone number or leave this blank.";
  if (!(enquiryTopics as readonly string[]).includes(topic)) errors.topic="Choose what you would like to ask about.";
  if (!(enquiryClasses as readonly string[]).includes(classInterest)) errors.classInterest="Choose a class or ‘Not sure yet’.";
  if (message.length < 10 || message.length > 3000 || /\x00/.test(message)) errors.message="Write a message between 10 and 3,000 characters.";
  if (data.consent !== true) errors.consent="Please confirm that the school may contact you about this enquiry.";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) errors.message="Please refresh the page and try again.";
  return Object.keys(errors).length ? {errors} : {value:{requestId,name,email,phone,topic,classInterest,message,consent:true}};
}
