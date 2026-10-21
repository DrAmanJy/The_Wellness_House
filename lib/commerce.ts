export interface SupplyVariant {id:string;title:string;supplyCode:string;priceMinor:string|null;currency:string;active:boolean;}
export function money(minor:string|number|null|undefined,currency='INR'){return minor===null||minor===undefined?'Price pending':new Intl.NumberFormat('en-IN',{style:'currency',currency,minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(minor)/100);}
