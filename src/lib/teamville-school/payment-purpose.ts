export const paymentPurposes=['Tuition','Books','Swimming','Uniform','Wednesday sportswear','Friday wear','Chess & Taekwondo','STEM & Robotics','UCMAS','Transport','Other / combined fees'] as const;
export function validPaymentPurpose(value:unknown){return typeof value==='string'&&paymentPurposes.some(p=>p===value)?value:null;}
